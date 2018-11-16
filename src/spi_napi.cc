#include <assert.h>
#include <cstdlib>
#include <cstdio>
#include <iostream>
#include <sstream>
#include <stdio.h>
#include <cstring>
#include <cerrno>
#include <stdexcept>
#include <napi.h>
// #include <assert.h>

// #define DECLARE_METHOD(name, func) { name, NULL, func, NULL, NULL, NULL, napi_enumerable, NULL }

#if __linux__
#include <linux/types.h>
#include <sys/ioctl.h>
#include <linux/spi/spidev.h>
#endif

/**
 * struct spi_ioc_transfer {
 *		__u64		tx_buf;
 *		__u64		rx_buf;
 *		__u32		len;
 *		__u32		speed_hz;
 *		__u16		delay_usecs;
 *		__u8		bits_per_word;
 *		__u8		cs_change;
 *		__u8		tx_nbits;
 *		__u8		rx_nbits;
 *		__u16		pad;
 * };
 */
#ifndef SPI_IOC_MESSAGE
struct spi_ioc_transfer {
	uintptr_t		tx_buf;
	uintptr_t		rx_buf;
	size_t			len;
	uint32_t		speed_hz;
};
#endif

class SpiTransfer : public Napi::AsyncWorker {
private:
	int fd;
	int err;
	uint32_t speed;
	uint8_t mode;
	uint8_t order;
	uint32_t readcount;
	size_t buflen;
	uint8_t* buffer;

public:
	SpiTransfer(
		Napi::Function& cb,
		int fd,
		uint32_t speed,
		uint8_t mode,
		uint8_t order,
		Napi::Buffer<uint8_t> writeBuffer,
		size_t readcount
	): 	AsyncWorker(cb),
		fd(fd),
		speed(speed),
		mode(mode),
		order(order),
		readcount(readcount)
	{
		size_t writeLength = writeBuffer.Length();
		buflen = (readcount > writeLength) ? readcount : writeLength;
		buffer = writeBuffer.Data();
	}

	~SpiTransfer() {}

	void Execute() {
		int status = 0;
	#ifdef SPI_IOC_MESSAGE
		status = ioctl(fd, SPI_IOC_WR_MODE, &mode);
		std::cout << "SPI_IOC_WR_MODE status: " << status << std::endl;
		if (status == -1) {
			std::cout << "Throwing an error" << std::endl;
			throw std::runtime_error("Bad status when trying to do something with SPI_IOC_WR_MODE");
		}
		status = ioctl(fd, SPI_IOC_WR_LSB_FIRST, &order);
		std::cout << "SPI_IOC_WR_LSB_FIRST status: " << status << std::endl;
		if (status == -1) {
			throw std::runtime_error("Bad status when trying to do something with SPI_IOC_WR_LSB_FIRST");
		}
		struct spi_ioc_transfer msg = {};
		msg.tx_buf = (uintptr_t)buffer;
		msg.rx_buf = (uintptr_t)buffer;
		msg.len = buflen;
		msg.speed_hz = speed;
		std::cout << "transfer struct created...sending meow" << std::endl;
		status = ioctl(fd, SPI_IOC_MESSAGE(1), &msg);
	#elif __GNUC__
		#warning "Building without SPI support"
		status = -1;
		errno = ENOSYS;
	#else
		#pragma message("Building without SPI support")
		status = -1;
		errno = ENOSYS;
	#endif
		err = (status == -1) ? errno : 0;
	}

	void OnOK() {
		std::cout << "On OK called... err?" << err << std::endl;
		Napi::Env env = Env();
		// Napi::HandleScope scope(env);
		if (err) {
			char msg[1024];
			snprintf(msg, sizeof(msg), "SPI error: %s (errno %i)", strerror(err), err);
			// throw Napi::Error::New(env, msg);
			// e = Nan::Error(msg);
			Callback().Call({ Napi::Error::New(env, msg).Value(), Env().Null() });
		}
		else {
			Callback().Call({ Env().Null(), Napi::String::New(Env(), "hi") });
		}
	}

	void OnError(const Napi::Error& e) {
		std::cout << "OnError called" << std::endl;
		Napi::HandleScope scope(Env());
		std::cout << "OnError called with message: " << e.Message() << std::endl;
		Callback().Call({ e.Value(), Env().Null() });
	}
};

Napi::Object ReadSpiSettings(const Napi::CallbackInfo& info) {
	auto env = info.Env();
	if (!info[0].IsNumber()) throw Napi::Error::New(env, "readSpiSettings expects a file descriptor as its argument!");
	auto fd = info[0].As<Napi::Number>().Uint32Value();
	auto settings = Napi::Object::New(env);
	settings.Set("mode", env.Null());
	settings.Set("order", env.Null());
	settings.Set("bitsPerWord", env.Null());
	settings.Set("speed", env.Null());

	#ifdef SPI_IOC_MESSAGE
		uint8_t order, bits;
		uint32_t mode, speed;
		ioctl(fd, SPI_IOC_RD_MODE32, &mode);
		ioctl(fd, SPI_IOC_RD_LSB_FIRST, &order);
		ioctl(fd, SPI_IOC_RD_BITS_PER_WORD, &bits);
		ioctl(fd, SPI_IOC_RD_MAX_SPEED_HZ, &speed);
		settings.Set("mode", Napi::Number::New(env, mode));
		settings.Set("order", Napi::Number::New(env, order));
		settings.Set("bitsPerWord", Napi::Number::New(env, bits));
		settings.Set("speed", Napi::Number::New(env, speed));
	#endif

	return settings;
}

Napi::Value getProp(Napi::Env& env, Napi::Object& obj, const char *key) {
	if (!obj.Has(key)) {
		std::stringstream ss;
		ss << "SPI config is missing the \"" << key << "\" property." << std::endl;
		throw Napi::Error::New(env, Napi::String::New(env, ss.str()));
	}

	return obj.Get(key);
}

Napi::Number getNumberProp(Napi::Env& env, Napi::Object& obj, const char *key) {
	Napi::Value _value = getProp(env, obj, key);

	if (!_value.IsNumber()) {
		std::stringstream ss;
		ss << "SPI config property \"" << key << "\" must be a number." << std::endl;
		throw Napi::Error::New(env, Napi::String::New(env, ss.str()));
	}

	return _value.As<Napi::Number>();
}

template <typename T>
Napi::Buffer<T> getBufferProp(Napi::Env& env, Napi::Object& obj, const char *key) {
	Napi::Value _value = getProp(env, obj, key);

	if (!_value.IsBuffer()) {
		std::stringstream ss;
		ss << "SPI config property \"" << key << "\" must be a buffer." << std::endl;
		throw Napi::Error::New(env, Napi::String::New(env, ss.str()));
	}

	return _value.As<Napi::Buffer<T>>();
}


Napi::Value Transfer(const Napi::CallbackInfo& info) {
	Napi::Env env = info.Env();
	if (!info[0].IsFunction()) throw Napi::Error::New(env, "The first argument of the SPI transfer method must be a callback function!");
	if (!info[1].IsObject()) throw Napi::Error::New(env, "The second argument of the SPI transfer method must be a config object!");
	auto cb = info[0].As<Napi::Function>();
	auto config = info[1].As<Napi::Object>();

	SpiTransfer *worker = new SpiTransfer(
	/* cb */		cb,
	/* fd */		getNumberProp(env, config, "fd").Int32Value(),
	/* speed */		getNumberProp(env, config, "speed").Uint32Value(),
	/* mode */		(uint8_t) getNumberProp(env, config, "mode").Uint32Value(),
	/* order */		(uint8_t) getNumberProp(env, config, "order").Uint32Value(),
	/* buffer */	getBufferProp<uint8_t>(env, config, "buffer"),
	/* readcount */	(size_t) getNumberProp(env, config, "readcount").Uint32Value()
	);
	worker->Queue();
	return config;
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set("transfer", Napi::Function::New(env, Transfer));
	exports.Set("readSpiSettings", Napi::Function::New(env, ReadSpiSettings));
	exports.Set("spiSupported", Napi::Boolean::New(env,
	#ifdef SPI_IOC_MESSAGE
		true
	#else
		false
	#endif
	));
	return exports;
}

NODE_API_MODULE(hello, Init)

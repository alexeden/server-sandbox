#include <napi.h>
#include <assert.h>
#include <chrono>
#include <thread>
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
		Napi::Function& callback,
		int fd,
		uint32_t speed,
		uint8_t mode,
		uint8_t order,
		Napi::Buffer<uint8_t> writeBuffer,
		size_t readcount
	): 	AsyncWorker(callback),
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
		if (status != -1) {
			status = ioctl(fd, SPI_IOC_WR_LSB_FIRST, &order);

			if (status != -1) {
				struct spi_ioc_transfer msg = {};
				msg.tx_buf = (uintptr_t)buffer;
				msg.rx_buf = (uintptr_t)buffer;
				msg.len = buflen;
				msg.speed_hz = speed;
				status = ioctl(fd, SPI_IOC_MESSAGE(1), &msg);
			}
		}
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
		Napi::HandleScope scope(Env());
		Callback().Call({Env().Null(), Napi::String::New(Env(), "hi")});
	}

	void OnError(const Napi::Error& e) {

	}
};

Napi::Value Transfer(const Napi::CallbackInfo& info) {
	// cb
	assert(info[0].IsFunction());
	Napi::Function cb = info[0].As<Napi::Function>();

	assert(info[1].IsObject());
	Napi::Object config = info[1].As<Napi::Object>();

	Napi::Value _fd = config.Get("fd");
	assert(_fd.IsNumber());

	Napi::Value _speed = config.Get("speed");
	assert(_speed.IsNumber());

	Napi::Value _mode = config.Get("mode");
	assert(_mode.IsNumber());

	Napi::Value _order = config.Get("order");
	assert(_order.IsNumber());

	Napi::Value _buffer = config.Get("buffer");
	assert(_buffer.IsBuffer());

	Napi::Value _readcount = config.Get("readcount");
	assert(_readcount.IsNumber());

	int fd = _fd.As<Napi::Number>().Int32Value();
	auto speed = _speed.As<Napi::Number>().Uint32Value();
	uint8_t mode = _mode.As<Napi::Number>().Uint32Value();
	uint8_t order = _order.As<Napi::Number>().Uint32Value();
	Napi::Buffer<uint8_t> buffer = _buffer.As<Napi::Buffer<uint8_t>>();
	size_t readcount = _readcount.As<Napi::Number>().Uint32Value();


	// fd
	// assert(info[0].IsNumber());
	// int fd = info[0].As<Napi::Number>().Int32Value();

	// // speed
	// assert(info[1].IsNumber());
	// auto speed = info[1].As<Napi::Number>().Uint32Value();

	// // mode
	// assert(info[2].IsNumber());
	// uint8_t mode = info[2].As<Napi::Number>().Uint32Value();

	// // order
	// assert(info[3].IsNumber());
	// uint8_t order = info[3].As<Napi::Number>().Uint32Value();

	// // buffer
	// assert(info[4].IsBuffer());
	// Napi::Buffer<uint8_t> buffer = info[4].As<Napi::Buffer<uint8_t>>();

	// // readcount
	// assert(info[5].IsNumber());
	// size_t readcount = info[5].As<Napi::Number>().Uint32Value();


	// SpiTransfer *worker = new SpiTransfer(cb, fd, speed, mode, order, buffer, readcount);
	// worker->Queue();
	// return info.Env().Undefined();
	return config;
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set(Napi::String::New(env, "transfer"), Napi::Function::New(env, Transfer));
	return exports;
}

NODE_API_MODULE(hello, Init)

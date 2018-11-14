#include <napi.h>
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
	std::string echo;
	int fd;
	int err;
	// uint32_t speed;
	// uint8_t mode;
	// uint8_t order;
	// uint32_t readcount;
	size_t buflen;
	Napi::Buffer<uint8_t>* buffer;

public:
	SpiTransfer(
		Napi::Function& callback,
		Napi::Buffer<uint8_t>* buffer,
		int fd
		// uint32_t speed,
		// uint8_t mode,
		// uint8_t order,
		// size_t readcount
	): 	AsyncWorker(callback),
		buffer(buffer),
		fd(fd)
		// speed(speed),
		// mode(mode),
		// order(order),
		// readcount(readcount)
	{

	}

	~SpiTransfer() {}

	void Execute() {
		// quick nap
		std::this_thread::sleep_for(std::chrono::seconds(1));
	}

	void OnOK() {
		Napi::HandleScope scope(Env());
		Callback().Call({Env().Null(), Napi::String::New(Env(), "hi")});
	}

	void OnError(const Napi::Error& e) {

	}
};

Napi::Value Transfer(const Napi::CallbackInfo& info) {
	Napi::Buffer<uint8_t> buffer = info[0].As<Napi::Buffer<uint8_t>>();
	int fd = info[1].As<Napi::Number>();
	Napi::Function cb = info[2].As<Napi::Function>();
	SpiTransfer *worker = new SpiTransfer(cb, &buffer, fd);
	worker->Queue();
	return info.Env().Undefined();
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
	// exports.Set(Napi::String::New(env, "echo"), Napi::Function::New(env, Echo));
	return exports;
}

NODE_API_MODULE(hello, Init)

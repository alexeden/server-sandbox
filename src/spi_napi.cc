#include <napi.h>
#include <chrono>
#include <thread>
// #include <assert.h>

// #define DECLARE_METHOD(name, func) { name, NULL, func, NULL, NULL, NULL, napi_enumerable, NULL }

class EchoWorker : public Napi::AsyncWorker {
	private:
        std::string echo;

    public:
        EchoWorker(
			Napi::Function& callback,
			std::string& echo
		): AsyncWorker(callback), echo(echo) {}

        ~EchoWorker() {}

    void Execute() {
		// quick nap
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    void OnOK() {
        Napi::HandleScope scope(Env());
        Callback().Call({Env().Null(), Napi::String::New(Env(), echo)});
    }
};

class EchoPromiseWorker : public Napi::AsyncWorker {
	private:
        std::string echo;
		Napi::Promise::Deferred deferred;
    public:
        EchoPromiseWorker(
			Napi::Function& callback,
			Napi::Promise::Deferred& deferred,
			std::string& echo
		): AsyncWorker(callback), deferred(deferred), echo(echo) {}

        ~EchoPromiseWorker() {}

    void Execute() {
		// quick nap
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    void OnOK() {
        Napi::HandleScope scope(Env());
		deferred.Resolve(NULL);
        // Callback().Call({});
    }
};

Napi::String Hello(const Napi::CallbackInfo& info) {
	Napi::Env env = info.Env();
	return Napi::String::New(env, "world");
}

Napi::Value Echo(const Napi::CallbackInfo& info) {
	std::string in = info[0].As<Napi::String>();
	Napi::Function cb = info[1].As<Napi::Function>();
	EchoWorker *worker = new EchoWorker(cb, in);
	worker->Queue();
	return info.Env().Undefined();
}

Napi::Promise EchoPromise(const Napi::CallbackInfo& info) {
	std::string in = info[0].As<Napi::String>();
	Napi::Function cb = Napi::Function::New(info.Env(), Napi::Function());
	Napi::Promise::Deferred deferred = Napi::Promise::Deferred::New(info.Env());
	EchoPromiseWorker *worker = new EchoPromiseWorker(cb, deferred, in);
	worker->Queue();
	return deferred.Promise();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
	exports.Set(Napi::String::New(env, "hello"), Napi::Function::New(env, Hello));
	exports.Set(Napi::String::New(env, "echo"), Napi::Function::New(env, Echo));
	exports.Set(Napi::String::New(env, "echoPromise"), Napi::Function::New(env, EchoPromise));
	return exports;
}

NODE_API_MODULE(hello, Init)

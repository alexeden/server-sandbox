const serialPort =  require('serialport');

module.exports = {
    list() {
        return new Promise((resolve, reject) => {
            serialPort.list((err, ports) => err
            ? console.error('serialPort.list error: ', err) || resolve([])
            : resolve(ports || []));
        });
    }
}

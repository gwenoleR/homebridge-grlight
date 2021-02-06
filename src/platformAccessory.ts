import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import fetch from 'node-fetch';
import { GRLightPlatform } from './platform';


/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class GRLightPlatformAccessory {
  private rgbService: Service;
  // private whiteService: Service;
  private name: string;
  private ip: string;
  private port: string;
  private protocol: string;
  private baseUrl: string;
  private debugMode: boolean;

  constructor(
    private readonly platform: GRLightPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.name = accessory.context.device.name;
    this.ip = accessory.context.device.ip;
    this.port = accessory.context.device.port || '80';
    this.protocol = accessory.context.device.protocol || 'http';
    this.debugMode = accessory.context.device.debug || false;

    this.baseUrl = `${this.protocol}://${this.ip}:${this.port}`;


    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'gwenoleR')
      .setCharacteristic(this.platform.Characteristic.Model, '1.0')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.rgbService = this.accessory.getService('rgbService' + this.name)
      || this.accessory.addService(this.platform.Service.Lightbulb, 'rgbService' + this.name);

    // set the service name, this is what is displayed as the default name on the Home app
    this.rgbService.setCharacteristic(this.platform.Characteristic.Name, this.name);

    // register handlers for the On/Off Characteristic
    this.rgbService.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .on('get', this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.rgbService.getCharacteristic(this.platform.Characteristic.Brightness)
      .on('set', this.setBrightness.bind(this))        // SET - bind to the 'setBrightness` method below
      .on('get', this.getBrightness.bind(this));       // GET - bind to the 'getBrightness` method below

    // register handlers for the Hue Characteristic
    this.rgbService.getCharacteristic(this.platform.Characteristic.Hue)
      .on('set', this.setHue.bind(this))        // SET - bind to the 'setHue` method below
      .on('get', this.getHue.bind(this));       // GET - bind to the 'getHue` method below

    // register handlers for the Hue Characteristic
    this.rgbService.getCharacteristic(this.platform.Characteristic.Saturation)
      .on('set', this.setSaturation.bind(this))        // SET - bind to the 'setSaturation` method below
      .on('get', this.getSaturation.bind(this));       // GET - bind to the 'getSaturation` method below


  }

  log = (message: string, ...parameters: any[]) => {
    this.debugMode ? this.platform.log.info(message, parameters) : this.platform.log.debug(message, parameters);
  };

  /**
  * Handle "SET" requests from HomeKit
  * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
  */
  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    // implement your own code to turn your device on/off
    const isOn = value as boolean;

    this.platform.log.debug('Set Characteristic On ->', value);

    fetch(`${this.baseUrl}/${isOn ? 'on' : 'off'}`)
      .then(_res => callback(null))
      .catch((err) => {
        this.platform.log.debug(err);
        callback(err);
      });
  }

  /**
  * Handle the "GET" requests from HomeKit
  * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
  * 
  * GET requests should return as fast as possbile. A long delay here will result in
  * HomeKit being unresponsive and a bad user experience in general.
  * 
  * If your device takes time to respond you should update the status of your device
  * asynchronously instead using the `updateCharacteristic` method instead.

  * @example
  * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
  */
  getOn(callback: CharacteristicGetCallback) {

    fetch(`${this.baseUrl}/state`)
      .then(res => res.json())
      .then((result) => {
        // you must call the callback function
        // the first argument should be null if there were no errors
        // the second argument should be the value to return
        this.log('Get Characteristic On ->', result.state);
        callback(null, result.state);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });

  }

  getWhiteOn(callback: CharacteristicGetCallback) {

    fetch(`${this.baseUrl}/state`)
      .then(res => res.json())
      .then((result) => {
        // you must call the callback function
        // the first argument should be null if there were no errors
        // the second argument should be the value to return
        this.log('Get Characteristic On ->', result.state);
        callback(null, result.state);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });

  }

  /**
  * Handle "SET" requests from HomeKit
  * These are sent when the user changes the state of an accessory, for example, changing the Brightness
  */
  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    fetch(`${this.baseUrl}/brightness/${value}`)
      .then(() => {
        this.log('Set Characteristic Brightness -> ', value);
        callback(null);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });
  }

  getBrightness(callback: CharacteristicSetCallback) {
    fetch(`${this.baseUrl}/brightness`)
      .then(res => res.json())
      .then((result) => {
        this.log('Get Characteristic Brightness -> ', result.brightness);
        callback(null, result.brightness);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });
  }

  setHue(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    fetch(`${this.baseUrl}/hue/${value}`)
      .then(() => {
        this.log('Set Characteristic Hue -> ', value);
        callback(null);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });
  }

  getHue(callback: CharacteristicSetCallback) {

    fetch(`${this.baseUrl}/hue`)
      .then(res => res.json())
      .then((result) => {
        this.log('Get Characteristic Hue -> ', result.hue);
        callback(null, result.hue);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });
  }

  setSaturation(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    fetch(`${this.baseUrl}/saturation/${value}`)
      .then(() => {
        this.log('Set Characteristic Saturation -> ', value);
        callback(null);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });
  }

  getSaturation(callback: CharacteristicSetCallback) {

    fetch(`${this.baseUrl}/saturation`)
      .then(res => res.json())
      .then((result) => {
        this.log('Get Characteristic Saturation -> ', result.saturation);
        callback(null, result.saturation);
      }).catch((err) => {
        this.log(err);
        callback(err);
      });
  }

}

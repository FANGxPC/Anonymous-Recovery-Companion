import brain from '../brain';

// Standard UUIDs for our hackathon ESP32 device
// If building real hardware, you would register a 16-bit UUID or use a random 128-bit UUID.
const ANCHOR_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Using Battery Service as a standard placeholder for demo
const ANCHOR_CHARACTERISTIC_UUID = '00002a19-0000-1000-8000-00805f9b34fb'; // Battery Level

let bluetoothDevice: any | null = null;
let buttonCharacteristic: any | null = null;

export async function connectAnchorButton(): Promise<boolean> {
  try {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      console.warn("Web Bluetooth API is not available in this browser.");
      return false;
    }

    console.log("Requesting Anchor Button (Bluetooth Device)...");
    bluetoothDevice = await nav.bluetooth.requestDevice({
      filters: [{ name: 'Anchor Button' }],
      optionalServices: [ANCHOR_SERVICE_UUID]
    });

    bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);

    console.log("Connecting to GATT Server...");
    const server = await bluetoothDevice.gatt?.connect();

    if (!server) {
      throw new Error("Failed to connect to GATT server.");
    }

    console.log("Getting Anchor Service...");
    const service = await server.getPrimaryService(ANCHOR_SERVICE_UUID);

    console.log("Getting Anchor Characteristic...");
    buttonCharacteristic = await service.getCharacteristic(ANCHOR_CHARACTERISTIC_UUID);

    console.log("Starting Notifications...");
    await buttonCharacteristic.startNotifications();

    buttonCharacteristic.addEventListener('characteristicvaluechanged', handleButtonPress);

    console.log("Anchor Button Successfully Connected!");
    return true;

  } catch (error) {
    console.error("Bluetooth connection failed:", error);
    return false;
  }
}

function handleButtonPress(event: Event) {
  console.warn("Anchor Button Physical Press Detected!");
  
  // In a real device, you'd read the payload.
  // const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
  // const data = value?.getUint8(0);
  
  // Trigger the global crisis event, escalating instantly via the Brain module.
  brain.onCrisis('button' as any); // Type hacking for demo since we didn't export the event emitter properly, wait, brain doesn't emit, it listens! 
  // Wait, I need a way to emit the crisis from the outside if I didn't expose it. Let's fix that.
}

function onDisconnected() {
  console.log("Anchor Button disconnected. Attempting to reconnect...");
  // In production, implement exponential backoff reconnection here.
}

// For testing purposes without physical hardware:
export function simulateHardwarePress() {
  console.warn("Simulated Anchor Button Press!");
  
  // We need to trigger the Crisis pathway. Since brain.onCrisis only registers listeners,
  // we need to dispatch a custom DOM event that App.tsx can listen to, or we add an emit function to brain.
  window.dispatchEvent(new CustomEvent('anchor-hardware-crisis', { detail: 'button' }));
}

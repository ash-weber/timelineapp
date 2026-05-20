export const getOrDeviceMac = () => {
  let deviceMac = localStorage.getItem('user_device_mac');
  if (!deviceMac) {
    const genMac = () => Array.from({length: 6}, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':');
    deviceMac = genMac();
    localStorage.setItem('user_device_mac', deviceMac);
  }
  return deviceMac;
};
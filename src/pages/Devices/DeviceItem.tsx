import { useCallback, useMemo } from 'react'

import { BlueAccessDevice, BlueDeviceInfo} from '@blueid/access-proto'
import { BlueIDAccess } from '@blueid/access-capacitor'

import './Devices.css';

const DeviceItem: React.FC<{
  allDevices: BlueAccessDevice[],
  nearbyDevice: BlueDeviceInfo,
}> = ({ allDevices, nearbyDevice }) => {

  const { deviceId, distanceMeters } = nearbyDevice

  const tryOpenLock = useCallback(async () => {
    try {
        await BlueIDAccess.runCommand('tryAccessDevice', nearbyDevice.deviceId)
    } catch (e: any) {
      alert(`Failed to open lock, ${e.message}`)
    }
  }, [])

  const objectName = useMemo(() => {
    return allDevices.find(device => device.deviceId === deviceId)?.objectName
  }, [deviceId, allDevices])

  return (
    <div className='item' onClick={tryOpenLock}>
      <div className='item-info id'>
        ID: {deviceId}
      </div>
      <div className='item-info'>
        Object: {objectName || 'unknown'}
      </div>
      {typeof distanceMeters === 'number' && (
        <div className='item-info'>
          Distance: {distanceMeters < 1 ? `${(distanceMeters * 100).toFixed(0)}cm` : `${distanceMeters?.toFixed(2)}m`}
        </div>
      )}
    </div>
  );
};

export default DeviceItem;

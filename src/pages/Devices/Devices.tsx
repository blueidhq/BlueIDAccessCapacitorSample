import { useState, useEffect, useCallback } from 'react'

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import { BlueAccessDevice, BlueDeviceInfo} from '@blueid/access-proto'
import { BlueAccessListener, BlueIDAccess } from '@blueid/access-capacitor'

import DeviceItem from './DeviceItem';

import './Devices.css';

const Devices: React.FC = () => {
  const [allDevices, setAllDevices] = useState<BlueAccessDevice[]>([])
  const [nearbyDevices, setNearbyDevices] = useState<BlueDeviceInfo[]>([])

  const updateDevices = useCallback(async () => {
    // Update all devies with all devices the user has access to based on credentials
    // these devices might not be nearby at the moment
    const result = await BlueIDAccess.runCommand('listAccessDevices')
    setAllDevices(result.devices)
  }, [])

  const startBluetoothScan = useCallback(async () => {
    if (!(await BlueIDAccess.runCommand('isBluetoothActive'))) {
        await BlueIDAccess.runCommand('bluetoothActivate')
    }
  }, [])

  const handleDeviceAddedOrUpdated = useCallback((deviceInfo: BlueDeviceInfo) => {
    const deviceIndex = nearbyDevices.findIndex(device => device.deviceId === deviceInfo.deviceId)
    if (deviceIndex >= 0) {
      setNearbyDevices(nearbyDevices.splice(deviceIndex, 1, deviceInfo))
    } else {
      setNearbyDevices(nearbyDevices.concat([deviceInfo]))
    }
  }, [nearbyDevices])

  const handleDeviceRemoved = useCallback((deviceInfo: BlueDeviceInfo) => {
    setNearbyDevices(nearbyDevices.filter(device => device.deviceId !== deviceInfo.deviceId))
  }, [nearbyDevices])

  useEffect(() => {
    updateDevices()
    startBluetoothScan()

    const listeners: Promise<BlueAccessListener>[] = []

    const syncFinishedListener = BlueIDAccess.addListener('tokenSyncFinished', () => updateDevices())
    const accessCredentialAddedListener = BlueIDAccess.addListener('accessCredentialAdded', () =>
        updateDevices(),
    )
    const deviceAddedListener = BlueIDAccess.addListener('deviceAdded', (deviceInfo) => {
      handleDeviceAddedOrUpdated(deviceInfo)
    })
    const deviceUpdatedListener = BlueIDAccess.addListener('deviceUpdated', (deviceInfo) => {
      handleDeviceAddedOrUpdated(deviceInfo)
    })
    const deviceRemovedListener = BlueIDAccess.addListener('deviceRemoved', (deviceInfo) => {
      handleDeviceRemoved(deviceInfo)
    })

    listeners.push(
      syncFinishedListener,
      accessCredentialAddedListener,
      deviceAddedListener,
      deviceUpdatedListener,
      deviceRemovedListener,
    )

    return () => {
      listeners.map(async listener =>
        (await listener).remove(),
      )
    }

    // Runs only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Devices</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className='root'>
          <div className='heading'>
            Nearby Devices
          </div>
          {nearbyDevices.map((device: BlueDeviceInfo) => (
            <DeviceItem key={device.deviceId} allDevices={allDevices} nearbyDevice={device}/>
          ))}
          <div className='bottom-hint'>
            {nearbyDevices.length ? 'Click on any device to try to open it' : 'No nearby devices found'}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Devices;

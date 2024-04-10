import { useState, useEffect, useCallback } from 'react'

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonInput, IonButton } from '@ionic/react';

import { BlueAccessCredential, BlueCredentialType, BlueLocalTimestamp } from '@blueid/access-proto'
import { BlueIDAccess } from '@blueid/access-capacitor'

import './Credentials.css';

const credentialTypeNameMap = {
  [`${BlueCredentialType.Regular}`]: 'Regular',
  [`${BlueCredentialType.Master}`]: 'Master',
  [`${BlueCredentialType.NfcWriter}`]: 'NfcWriter',
  [`${BlueCredentialType.Maintenance}`]: 'Maintenance',
  [`${BlueCredentialType.Emergency}`]: 'Emergency',
}

function blueTimeStampToDate(blueTimestamp: BlueLocalTimestamp | undefined): string {
  if (!blueTimestamp) {
      return ''
  }

  return new Date(
      blueTimestamp.year,
      blueTimestamp.month - 1,
      blueTimestamp.date,
      blueTimestamp.hours,
      blueTimestamp.minutes,
      blueTimestamp.seconds,
  )
      .toISOString()
      .substring(0, 19)
}

const Credentials: React.FC = () => {
  const [activationToken, setActivationToken] = useState('')
  const [credentials, setCredentials] = useState<BlueAccessCredential[]>([])

  const loadCredentials = useCallback(async () => {
    const result = await BlueIDAccess.runCommand('getAccessCredentials')
    setCredentials(result.credentials)
  }, [])

  useEffect(() => {
    loadCredentials()

    const syncFinishedListener = BlueIDAccess.addListener('tokenSyncFinished', () => loadCredentials())
    const accessCredentialAddedLListener = BlueIDAccess.addListener('accessCredentialAdded', () =>
        loadCredentials(),
    )

    return () => {
        // eslint-disable-next-line no-extra-semi
        ;[syncFinishedListener, accessCredentialAddedLListener].map(async listener =>
            (await listener).remove(),
        )
    }
    // Runs only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClaim = useCallback(async () => {
    try {
        await BlueIDAccess.runCommand('claimAccessCredential', activationToken)
        loadCredentials()
        setActivationToken('')
        alert('Credential claimed')
    } catch (e: any) {
        alert(`Claim failed, ${e.message}`)
    }
  }, [activationToken, loadCredentials])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Credentials</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className='root'>
          <div className='heading'>
              Add Credential
          </div>
          <div className='row'>
            <IonInput
              placeholder="Activation token"
              value={activationToken}
              onIonInput={(e: any) => setActivationToken(e.target.value)}
            />
            <IonButton
              size="small"
              disabled={!activationToken}
              onClick={handleClaim}
            >
              Claim
            </IonButton>
          </div>
          <div className='heading credentials'>
              Credentials
          </div>
          {credentials.map((credential, index) => (
            <div key={index} className='item'>
              <div className='item-info id'>
                ID: {credential.credentialId?.id}
              </div>
              <div className='item-info'>
                Name: {credential.name}
              </div>
              <div className='item-info'>
                Site: {credential.siteName}
              </div>
              <div className='item-info'>
                Type: {credentialTypeNameMap[credential.credentialType]}
              </div>
              <div className='item-info'>
                Valid from: {blueTimeStampToDate(credential.validFrom)}
              </div>
              <div className='item-info'>
                Valid to: {blueTimeStampToDate(credential.validTo)}
              </div>
              <div className='item-info'>
                Validity: {blueTimeStampToDate(credential.validity)}
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Credentials;

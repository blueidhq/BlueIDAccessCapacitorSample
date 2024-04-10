import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonTabs, IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Devices from './pages/Devices';
import Credentials from './pages/Credentials';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './App.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/devices">
                <Devices />
              </Route>
              <Route exact path="/credentials">
                <Credentials />
              </Route>
              <Route exact path="/">
                <Redirect to="/devices" />
              </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="devices" href="/devices">
                    <IonLabel>Devices</IonLabel>
              </IonTabButton>
              <IonTabButton tab="credentials" href="/credentials">
                    <IonLabel>Credentials</IonLabel>
              </IonTabButton>
            </IonTabBar>
        </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;

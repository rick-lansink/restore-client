import BimServerClient from "../libs/BIMServerClient/bimserverclient"
import {BIMServerLoaderPlugin} from "@xeokit/xeokit-sdk/src/plugins/BIMServerLoaderPlugin/BIMServerLoaderPlugin.js";
import {Viewer} from "@xeokit/xeokit-sdk/src/viewer/Viewer";

export default {
    BIM_SERVER_ADDRESS: 'http://localhost:8080',
    CLIENT_NAME: 'ReStore',
    CLIENT_DESCRIPTION: 'Service for creating search requests for second-hand materials',
    CLIENT_URL: 'https://localhost:8081',
    REDIRECT_URL: document.location.href,
    USER_NAME: 'rick.lansink@jstack.eu',
    PASSWORD: 'test12345',
    poid: 196609,

    initViewer: function (canvas) {
      let viewer = new Viewer({
          canvasElement: canvas,
          transparent: true
      });

        viewer.scene.xrayMaterial.fillAlpha = 0.1;
        viewer.scene.xrayMaterial.fillColor = [0, 0, 0];
        viewer.scene.xrayMaterial.edgeAlpha = 0.4;
        viewer.scene.xrayMaterial.edgeColor = [0, 0, 0];

        viewer.scene.highlightMaterial.fillAlpha = 0.3;
        viewer.scene.highlightMaterial.edgeColor = [1, 1, 0];
        return viewer;
    },
    initClient: function () {
        let client = new BimServerClient(this.BIM_SERVER_ADDRESS);
        return new Promise((resolve) => {
            client.init((result) => {
                return resolve(result);
            })
        })
    },
    initLoader: function (viewer, client) {
        return new BIMServerLoaderPlugin(viewer, {
            bimServerClient: client
        });

    },
    clientLogin: function (client, login) {
        return new Promise((resolve) => {
            client.init(() => {
                client.login(
                    login ? login.username : this.USER_NAME,
                    login ? login.password : this.PASSWORD,
                    (result) => {
                        return resolve(result);
                    })
            });
        })
        //await (util.promisify(client.login))(this.USER_NAME, this.PASSWORD);
    },
    oAuthRegister: async function() {
        let response = await fetch(this.BIM_SERVER_ADDRESS + '/oauth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                redirect_url: this.REDIRECT_URL,
                client_name: this.CLIENT_NAME,
                client_description: this.CLIENT_DESCRIPTION,
                client_url: this.CLIENT_URL,
                type: 'pull'
            })
        });
        return response.json();
    },
    oAuthLogin: async function(registration) {
      console.log(registration);
      document.location = `${this.BIM_SERVER_ADDRESS}/oauth/authorize+?redirect_uri=${document.location}&response_type=code&client_id=restore&auth_type=singleproject`
    },
    callClient: function (client, {
        interfaceName, methodName, data
    }) {
        return new Promise((resolve) => {
            client.call(interfaceName, methodName, data, (response) => {
                return resolve(response);
            })
        })
    },
    fixedEncodeUriComponent: function(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
        });
    },
    fetchClientProject: async function(client, poid) {
      return new Promise((resolve, reject) => {
          client.call('ServiceInterface', 'getProjectByPoid', {
                  poid: poid
              }, (project) => {
                return resolve(project);
              }, (err) => {
                return reject(err);
              }
          )
      });
    },
};
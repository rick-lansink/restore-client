import BimServerClient from "../libs/BIMServerClient/bimserverclient"
import {BIMServerLoaderPlugin} from "@xeokit/xeokit-sdk/src/plugins/BIMServerLoaderPlugin/BIMServerLoaderPlugin.js";
import {Viewer} from "@xeokit/xeokit-sdk/src/viewer/Viewer";

export default {
    BIM_SERVER_ADDRESS: 'https://bimserver.link:8443',
    CLIENT_NAME: 'ReStore',
    CLIENT_DESCRIPTION: 'Service for creating search requests for second-hand materials',
    CLIENT_URL: 'https://localhost:8080',
    REDIRECT_URL: document.location.href,
    poid: 196609,

    initViewer: function (canvas) {
      let viewer = new Viewer({
          canvasElement: canvas,
          transparent: true,
      });

        viewer.camera.eye = [-3.933, 2.855, 27.018];
        viewer.camera.look = [4.400, 3.724, 8.899];
        viewer.camera.up = [-0.018, 0.999, 0.039];

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
    oAuthLogin: async function(redirectUri) {
      console.log(redirectUri);
      document.location = `${this.BIM_SERVER_ADDRESS}/oauth/authorize+?redirect_uri=${window.location.origin}${redirectUri}&response_type=code&client_id=restore&auth_type=singleproject`
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
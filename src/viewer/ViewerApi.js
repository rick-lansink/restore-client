import BimServerClient from "@xeokit/xeokit-sdk/src/plugins/BIMServerLoaderPlugin/BIMServerClient/bimserverclient";
import {BIMServerLoaderPlugin} from "@xeokit/xeokit-sdk/src/plugins/BIMServerLoaderPlugin/BIMServerLoaderPlugin.js";
import {Viewer} from "@xeokit/xeokit-sdk/src/viewer/Viewer";

export default {
    BIM_SERVER_ADDRESS: 'http://localhost:8080',
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
        return new BimServerClient(this.BIM_SERVER_ADDRESS);
    },
    initLoader: function (viewer, client) {
        return new BIMServerLoaderPlugin(viewer, {
            bimServerClient: client
        })
    },
    clientLogin: function (client) {
        return new Promise((resolve) => {
            client.init(() => {
                client.login(this.USER_NAME, this.PASSWORD, (result) => {
                    return resolve(result);
                })
            });
        })
        //await (util.promisify(client.login))(this.USER_NAME, this.PASSWORD);
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
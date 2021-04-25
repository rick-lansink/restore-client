<template>
  <div class="viewer__wrapper">
    <div class="viewer__title">
      <b-container>
        <component-title>
          BIM Viewer
          <b-dropdown size="sm" variant="link">
            <b-dropdown-form>
              <b-form-group label="Viewer mode">
                <b-form-radio v-model="internalViewerMode"  name="viewer-mode" value="xray">X-Ray</b-form-radio>
                <b-form-radio v-model="internalViewerMode"  name="viewer-mode" value="hide">Hide / show</b-form-radio>
              </b-form-group>
            </b-dropdown-form>
          </b-dropdown>
        </component-title>
      </b-container>
    </div>
    <canvas class="viewer__canvas" :id="bimViewerId" ref="canvas" />
  </div>
</template>

<script>
import viewerApi from "../../viewer/ViewerApi";
//import {NavCubePlugin} from "@xeokit/xeokit-sdk/src/plugins/NavCubePlugin/NavCubePlugin.js";
import {mapGetters} from "vuex";
import ComponentTitle from "../typography/ComponentTitle";
export default {
  name: "BimViewer",
  components: {ComponentTitle},
  props: {
    project: {
      type: Object,
      default: () => {}
    },
    client: {
      type: Object,
      default: () => {}
    }
  },
  data: function() {
    return {
      bimViewerId: 'bim-viewer',
      viewer: null,
      loader: null,
      model: {},
      lastEntity: null
    }
  },
  computed: {
    ...mapGetters({
      'selectedItems': 'viewer/selectedItems',
      'viewerMode': 'viewer/viewerMode',
      'hideOthers': 'viewer/hideOthers'
    }),
    internalViewerMode: {
      get() {
        return this.viewerMode;
      },
      set(mode) {
        if (mode) {
          this.$store.dispatch('viewer/setViewerMode', {mode});
        }
      }
    },
    getProjectRoid() {
      return this.project ? this.project.lastRevisionId : '';
    },
    getProjectSchema()  {
      return this.project ? this.project.schema : '';
    }
  },
  async mounted() {
    this.initViewer();
    this.initLoader();
    //this.initNavCube();
    if (this.project && this.project.oid) {
      await this.setupViewer();
    }
  },
  watch: {
    project: function(project) {
      if (project) {
        this.setupViewer();
      }
    },
    selectedItems: function(items) {
      if (items && items.length > 0) {
        this.updateViewerSelection();
      } else {
        this.resetViewer();
      }

    },
    viewerMode: function() {
      this.updateViewerSelection();
    }
  },
  methods: {
    initViewer() {
      this.viewer = viewerApi.initViewer(this.$refs.canvas)
    },
    initLoader() {
      this.loader = viewerApi.initLoader(this.viewer, this.client);
    },
    initNavCube() {
      // new NavCubePlugin(this.viewer, {
      //   canvasId: "cube-canvas",
      //   visible: true,
      //   size: 50,
      //   alignment: "bottomRight",
      //   bottomMargin: 20,
      //   rightMargin: 10
      // });
    },
    async setupViewer() {
      this.model = this.loader.load({
        id: "bimModel",
        poid: this.project.oid,
        roid: this.getProjectRoid,
        schema: this.getProjectSchema,
        edges: true,
        lambertMaterial: true,
        scale: [0.001, 0.001, 0.001],
        rotation: [-90, 0, 0,]
      })
      this.addModelListeners();
    },
    updateViewerSelection() {
      if(this.viewerMode === 'xray') {
        if(this.hideOthers) {
          this.xrayOthers(this.selectedItems);
        } else {
          this.xrayItems(this.selectedItems);
        }
      } else if (this.viewerMode === 'hide') {
        if(this.hideOthers) {
          this.hideOtherItems(this.selectedItems);
        } else {
          this.xrayItems(this.selectedItems);
        }
      }
    },
    xrayOthers(objectIds) {
      let scene = this.viewer.scene;
      scene.setObjectsVisible(scene.objectIds, true);
      scene.setObjectsXRayed(scene.objectIds, true);
      scene.setObjectsSelected(scene.selectedObjectIds, false);
      scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
      objectIds.map((objectId) => {
        let entity = scene.objects[objectId];
        if (entity) {
          entity.xrayed = false;
        }
      })
    },
    resetViewer() {
      let scene = this.viewer.scene;
      scene.setObjectsVisible(scene.objectIds, true);
      scene.setObjectsXRayed(scene.objectIds, false);
      scene.setObjectsSelected(scene.selectedObjectIds, false);
      scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
    },
    xrayItems(objectIds) {
      let scene = this.viewer.scene;
      objectIds.map((objectId) => {
        let entity = scene.objects[objectId];
        if (entity) {
          entity.xrayed = true;
        }
      })
    },
    hideOtherItems(objectIds) {
      let scene = this.viewer.scene;
      scene.setObjectsVisible(scene.objectIds, false);
      scene.setObjectsXRayed(scene.objectIds, false);
      scene.setObjectsSelected(scene.selectedObjectIds, false);
      scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
      objectIds.map((objectId) => {
        let entity = scene.objects[objectId];
        if (entity) {
          entity.visible = true;
        }
      });
      this.jumpToModel();
    },
    jumpToModel() {
      this.viewer.cameraFlight.jumpTo(this.model);
    },
    addModelListeners() {
      // Fit camera to model when loaded
      this.model.on("loaded", () => {
        console.log('model has loaded');
        this.viewer.cameraFlight.fit = true;
        this.viewer.cameraFlight.fitFOV = 55;
        this.viewer.cameraFlight.jumpTo(this.model);
        this.updateViewerSelection();
      });

      this.model.on("error", (errMsg) => {
        console.log("Error while loading: " + errMsg);
      })

      // this.viewer.scene.input.on("mousemove", (coords) => {
      //   let hit = this.viewer.scene.pick({
      //     canvasPos: coords
      //   })
      //   if (hit) {
      //     if (!this.lastEntity || hit.entity.id !== this.lastEntity.id) {
      //       if (this.lastEntity) {
      //         this.lastEntity.highlighted = false;
      //       }
      //
      //       this.lastEntity = hit.entity;
      //       hit.entity.highlighted = true;
      //     } else {
      //       if (this.lastEntity) {
      //         this.lastEntity.highlighted = false;
      //         this.lastEntity = null;
      //       }
      //     }
      //   }
      // });

      // this.viewer.scene.on("mouseclicked", (coords) => {
      //   let hit = this.viewer.scene({
      //     canvasPos: coords
      //   })
      //   if (hit) {
      //     let entity = hit.entity;
      //     let metaObject = this.viewer.metaScene.metaObjects[entity.id];
      //     if (metaObject) {
      //       console.log(JSON.stringify(metaObject.getJSON(), null, "\t"));
      //     } else {
      //       const parent = entity.parent;
      //       if (parent) {
      //         metaObject = this.viewer.metaScene.metaObjects[parent.id];
      //         if (metaObject) {
      //           console.log(JSON.stringify(metaObject.getJSON(), null, "\t"));
      //         }
      //       }
      //     }
      //   }
      // });
    }
  }
}
</script>

<style lang="scss">
.viewer {
  &__wrapper {
    flex: 1;
    display: flex;
    height: 100%;
    position: relative;
    flex-direction: column;
  }
  &__title {
    position: relative;
    margin-left: 10%;
  }
  &__canvas {
    width: 100%;
    height: calc(100% - 30px);
  }
}
</style>
<template>
  <div class="viewer__wrapper">
    <canvas class="viewer__canvas" :id="bimViewerId" ref="canvas" />
    <canvas id="cube-canvas" ref="cubeCanvas" />
  </div>
</template>

<script>
import viewerApi from "../../viewer/ViewerApi";
import {NavCubePlugin} from "@xeokit/xeokit-sdk/src/plugins/NavCubePlugin/NavCubePlugin.js";
export default {
  name: "BimViewer",
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
    this.initNavCube();
    if (this.project && this.project.oid) {
      await this.setupViewer();
    }
  },
  watch: {
    project: function(project) {
      if (project) {
        console.log('project changed');
        this.setupViewer();
      }
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
      new NavCubePlugin(this.viewer, {
        canvasId: "cube-canvas",
        visible: true,
        size: 50,
        alignment: "bottomRight",
        bottomMargin: 20,
        rightMargin: 10
      });
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
    addModelListeners() {
      // Fit camera to model when loaded
      this.model.on("loaded", () => {
        this.viewer.cameraFlight.jumpTo(this.model);
      });

      this.model.on("error", (errMsg) => {
        console.log("Error while loading: " + errMsg);
      })
      this.viewer.scene.input.on("mousemove", (coords) => {
        let hit = this.viewer.scene.pick({
          canvasPos: coords
        })
        if (hit) {
          if (!this.lastEntity || hit.entity.id !== this.lastEntity.id) {
            if (this.lastEntity) {
              this.lastEntity.highlighted = false;
            }

            this.lastEntity = hit.entity;
            hit.entity.highlighted = true;
          } else {
            if (this.lastEntity) {
              this.lastEntity.highlighted = false;
              this.lastEntity = null;
            }
          }
        }
      });

      this.viewer.scene.on("mouseclicked", (coords) => {
        let hit = this.viewer.scene({
          canvasPos: coords
        })
        if (hit) {
          let entity = hit.entity;
          let metaObject = this.viewer.metaScene.metaObjects[entity.id];
          if (metaObject) {
            console.log(JSON.stringify(metaObject.getJSON(), null, "\t"));
          } else {
            const parent = entity.parent;
            if (parent) {
              metaObject = this.viewer.metaScene.metaObjects[parent.id];
              if (metaObject) {
                console.log(JSON.stringify(metaObject.getJSON(), null, "\t"));
              }
            }
          }
        }
      });
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
  }
  &__canvas {
    width: 100%;
    height: 100%;
  }
}

#cube-canvas {
  position: absolute;
  width: 50px;
  height: 50px;
  bottom: 20px;
  right: 10px;
  z-index: 200000;
}
</style>
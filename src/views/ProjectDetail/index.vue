<template>
  <restore-container>
    <div class="restore__container__header">
      <app-header />
      <page-title>{{ project.name }}</page-title>
    </div>
    <restore-tree-sidebar>
      <router-view
          name="sidebar"
          :client="client"
          :project="project"
          :set-top-data="setTopData"
      />
    </restore-tree-sidebar>
    <restore-main-view>
      <restore-top-main>
        <router-view
            name="topview"
            :project="project"
            :data="topData"
            @reset="topData = {}"
        />
      </restore-top-main>
      <restore-bottom-main>
        <bim-viewer
            v-if="project.oid"
            ref="viewer"
            :project="project"
            :client="client"
        />
      </restore-bottom-main>
    </restore-main-view>

  </restore-container>
</template>
<script>
import RestoreContainer from "../../components/layout/RestoreContainer";
import RestoreTopMain from "../../components/layout/RestoreTopMain";
import RestoreBottomMain from "../../components/layout/RestoreBottomMain";
import RestoreTreeSidebar from "../../components/layout/RestoreTreeSidebar";
import RestoreMainView from "../../components/layout/RestoreMainView";
import viewerApi from "@/viewer/ViewerApi";
import PageTitle from "../../components/typography/PageTitle";
import BimViewer from "../../components/viewer/BimViewer";
import {mapActions, mapGetters} from "vuex";
import AppHeader from "../../components/layout/AppHeader";
export default {
  name: 'ProjectDetail',
  components: {
    AppHeader,
    BimViewer,
    PageTitle,
    RestoreBottomMain,
    RestoreMainView,
    RestoreTopMain,
    RestoreContainer,
    RestoreTreeSidebar
  },
  data: function() {
    return {
      client: null,
      project: {},
      topData: {}
    }
  },
  computed: {
    ...mapGetters({
      token: 'bimAuth/token'
    }),
    selectedMaterial() {
      return this.rootMaterials[this.selectedRootMaterialName]
    }
  },
  watch: {
    token: async function(token) {
      this.client.setAuthToken(token);
      await this.getUserProject(this.$route.params.projectId);
    },
  },
  async mounted() {
    await this.initClient();
    await this.fetchToken({projectId: this.$route.params.projectId});
  },
  methods: {
    ...mapActions({
      'fetchToken': 'bimAuth/fetchOAuthToken'
    }),
    setTopData(data) {
      this.topData = data;
    },
    async initClient() {
      this.client = await viewerApi.initClient();
    },
    selectRootMaterial() {
    },
    highlightMaterial(objectIds) {
      this.$refs.viewer.xrayOthers(objectIds);
    },
    async getUserProject(poid) {
      this.project = await viewerApi.callClient(this.client, {
        interfaceName: 'ServiceInterface',
        methodName: 'getProjectByPoid',
        data: {
          poid: poid
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import "@/assets/styling/colors.scss";
.btn-link.inverse {
  color: $inverse-text-color !important;
}
</style>
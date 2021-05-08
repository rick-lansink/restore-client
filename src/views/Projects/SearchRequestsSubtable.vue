<template>
  <b-container :fluid="true">
    <page-title small>Search requests</page-title>
    <div class="requests-gantt">
      <svg ref="gantt" />
    </div>
    <b-button
        v-if="!hideViewButton"
        variant="primary"
        @click="() => {
      $router.push(`/project/${parentId}/overview`)
    }">
      View project
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from "../../components/typography/PageTitle";
import Gantt from 'frappe-gantt';
import moment from 'moment';
export default {
  name: "SearchRequestsSubtable",
  components: {
    PageTitle
  },
  props: {
    searchRequests: {
      type: Array,
      default: () => []
    },
    project: {
      type: Object,
      default: () => {}
    },
    parentId: {
      type: String,
      default: ''
    },
    hideViewButton: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      gantt: {}
    }
  },
  computed: {
    ganttItems() {
      return [
        {
          id: this.project.id,
          name: this.project.name,
          start: new Date(this.project.created_at).toISOString().split('T')[0],
          end: new Date(this.project.dueDate).toISOString().split('T')[0],
          dependencies: this.requestDependenciesString,
          custom_class: 'bar-milestone',
          progress: this.projectProgress
        },
        ...this.requestGanttItems
      ]
    },
    requestGanttItems() {
      return this.searchRequests.map((request) => {
        return {
          id: request.id,
          name: request.name,
          start: new Date(request.deliveryFrom).toISOString().split('T')[0],
          end: new Date(request.deliveryUntil).toISOString().split('T')[0],
          custom_class: `bar-${request.priority}`
        }
      })
    },
    requestDependenciesString() {
      return this.searchRequests.map((request) => {
        return request.id
      }).toString();
    },
    projectProgress() {
      const totalNumberOfDays = moment(this.project.dueDate).diff(moment(this.project.created_at), 'days')
      const expiredDays = moment(new Date().toISOString().split('T')[0]).diff(moment(this.project.created_at), 'days')
      return expiredDays / totalNumberOfDays * 100;
    },
    requestProgress(request) {
      const totalNumberOfDays = moment(request.deliveryUntil).diff(moment(request.deliveryFrom), 'days')
      const expiredDays = moment(new Date().toISOString().split('T')[0]).diff(moment(request.deliveryFrom), 'days')
      return expiredDays / totalNumberOfDays * 100;
    }
  },
  mounted() {
    this.setupGanttChart();
  },
  methods: {
    setupGanttChart() {
      this.gantt = new Gantt(this.$refs.gantt, this.ganttItems, {
        view_mode: 'Month',
        arrow_curve: 0
      })
    }
  }
}
</script>

<style lang="scss">
@import "~frappe-gantt/dist/frappe-gantt.css";
</style>

<style lang="scss">
@import '../../assets/styling/colors';
.requests-gantt {
  max-width: 100%;
  overflow: scroll;
  .gantt-container {
    max-width: 100%;
    overflow: scroll;
    svg {
      overflow: hidden;
    }
  }
}

.bar-milestone {
  .bar {
    fill: $primary-color
  }
}

.bar-GO {
  .bar {
    fill: $stoplight-three
  }
}

.bar-ON_HOLD {
  .bar {
    fill: $stoplight-two
  }
}

.bar-NO_GO {
  .bar {
    fill: $stoplight-one
  }
}

.gantt .bar-wrapper {
  pointer-events: none;
}
</style>
<template>
  <div>
    <app-header />
    <b-card>
      <page-title>Edit project</page-title>
      <b-form
          @submit="onSubmit"
          @reset="onReset"
      >
        <b-row>
          <b-col>
            <b-form-group
                label="Project name"
                label-for="input-name"
            >
              <b-form-input
                  id="input-name"
                  v-model="project.name"
                  placeholder="Enter name"
                  required
              />
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group>
              <label for="input-due-date">Choose a due date</label>
              <b-form-datepicker id="input-due-date" v-model="project.dueDate" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-button type="submit" variant="primary">Save</b-button> &nbsp;
        <b-button type="reset" variant="danger">Cancel</b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script>
import PageTitle from "../../components/typography/PageTitle";
import {updateProject, getProjectById} from "@/graphql/Project.graphql";
import AppHeader from "../../components/layout/AppHeader";
export default {
name: "Create",
  components: {AppHeader, PageTitle},
  data: function() {
    return {
      project: {}
    }
  },
  apollo: {
    project: {
      query: getProjectById,
      update: data => data.Project[0],
      fetchPolicy: 'no-cache',
      variables() {
        return {
          projectId: this.$route.params.projectId
        }
      }
    },
  },
  async mounted() {

  },
  methods: {
    async onSubmit(e) {
      e.preventDefault();
      await this.$apollo.mutate({
        mutation: updateProject,
        variables: {
          projectId: this.$route.params.projectId,
          name: this.project.name,
          due: new Date(this.project.dueDate)
        }
      });
      this.$toasted.info('Project updated', {
        duration: 5000
      });
      this.$router.push('/projects');
    },
    onReset(e) {
      e.preventDefault();
      this.$router.push('/projects');
    },
  }
}
</script>

<style scoped>

</style>
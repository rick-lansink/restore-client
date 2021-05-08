<template>
  <div>
    <app-header />
    <b-progress :value="formStep" :max="3" />
    <br/>
    <b-card>
      <page-title>Create new project</page-title>
      <b-form
          v-if="showForm"
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
                  v-model="form.name"
                  placeholder="Enter name"
                  required
              />
            </b-form-group>
          </b-col>
          <b-col>
            <b-form-group>
              <label for="input-due-date">Choose a due date</label>
              <b-form-datepicker id="input-due-date" v-model="form.dueDate" />
            </b-form-group>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-group>
              <label>Should search requests of this project be public?</label>
              <b-checkbox
                  v-model="form.isPublic"
                  :unchecked-value="false"
                  :value="true"
                  switch
              />
            </b-form-group>
          </b-col>
        </b-row>
        <b-button type="submit" variant="primary">Next</b-button> &nbsp;
        <b-button type="reset" variant="danger">Reset</b-button>
      </b-form>
      <b-container :fluid="true" v-else >
        <p>To use this project, Restore needs access to a BIMServer project.</p>
        <p>Click the button below to connect a project. If you have no account, or no projects on your account, please contact your BIMServer administrator.</p>
        <b-button variant="primary" @click="attachOAuth">Attach project</b-button>
      </b-container>
    </b-card>
  </div>
</template>

<script>
import PageTitle from "../../components/typography/PageTitle";
import viewerApi from '../../viewer/ViewerApi';
import {createProject} from "@/graphql/Project.graphql";
import AppHeader from "../../components/layout/AppHeader";
export default {
name: "Create",
  components: {AppHeader, PageTitle},
  data: function() {
    return {
      form: {
        name: '',
        dueDate: '',
        isPublic: false
      },
      showForm: true,
      formStep: 1,
      projectId: null
    }
  },
  methods: {
    async onSubmit(e) {
      e.preventDefault();
      let response = await this.$apollo.mutate({
        mutation: createProject,
        variables: {
          name: this.form.name,
          due: new Date(this.form.dueDate),
          isPublic: this.form.isPublic
        }
      });
      if(response.data.insert_Project.__typename === 'Project_mutation_response') {
        this.showForm = false;
        this.formStep = 2;
        console.log(response.data.insert_Project)
        this.projectId = response.data.insert_Project.returning[0].internalId;
      }
    },
    onReset(e) {
      e.preventDefault();
      this.form.name = '';
      this.form.dueDate = ''
      this.form.isPublic = false;
      this.form.ifcFile = null;
    },
    async attachOAuth() {
      await viewerApi.oAuthRegister();
      await viewerApi.oAuthLogin(`/projects/attachOAuth/${this.projectId}`)
    }
  }
}
</script>

<style scoped>

</style>
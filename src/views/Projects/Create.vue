<template>
  <b-card>
    <page-title>Create new project</page-title>
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
            {{form.dueDate}}
          </b-form-group>
        </b-col>
      </b-row>
      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>
    </b-form>
  </b-card>
</template>

<script>
import PageTitle from "../../components/typography/PageTitle";
import {createProject} from "@/graphql/Project.graphql";
export default {
name: "Create",
  components: {PageTitle},
  data: function() {
    return {
      form: {
        name: '',
        dueDate: '',
        ifcFile: null
      }
    }
  },
  async mounted() {
    //await this.initClient();

  },
  methods: {
    async onSubmit(e) {
      e.preventDefault();
      let response = await this.$apollo.mutate({
        mutation: createProject,
        variables: {
          name: this.form.name,
          due: new Date(this.form.dueDate)
        }
      });
      console.log(response);
      if(response.data.insert_Project.__typename === 'Project_mutation_response') {
        this.$router.push('/projects');
      }
    },
    onReset(e) {
      e.preventDefault();
      this.form.name = '';
      this.form.dueDate = ''
      this.form.ifcFile = null;
    }
  }
}
</script>

<style scoped>

</style>
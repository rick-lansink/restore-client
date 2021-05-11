<template>
  <div></div>
</template>

<script>
import store from '@/store';

export default {
  name: "AttachOAuth",
  async mounted() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.has('code') && urlParams.has('poid')) {
      await store.dispatch('bimAuth/syncOAuthCodes', {
        poid: urlParams.get('poid'),
        newOAuthToken: urlParams.get('code'),
        internalId: this.$route.params.id,
        revisionId: urlParams.get('')
      })
    }
  }
}
</script>

<style scoped>

</style>
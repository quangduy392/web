<template>
    <div class="container-fluid text-center">
        <b-jumbotron class="bg-transparent">
            <template slot="header">
                <i class="fa fa-exclamation-triangle mr-2 text-warning"></i>
                <span class="font-weight-bold">404</span></template
            >
            <template slot="lead">
                <h3 class="font-weight-bold">{{$t('errorPage.pageNotFound')}}</h3>
            </template>
            <p>{{$t('errorPage.content')}}</p>
            <b-button variant="outline-primary" @click="goToHome">{{$t('errorPage.goHome')}}</b-button>
        </b-jumbotron>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    components: {},
    mounted: function() {
        this.$nextTick(function() {});
    },
    data: function() {
        return {};
    },
    computed: {
        ...mapState({})
    },
    methods: {
        ...mapActions({}),
        goToHome() {
            this.$router.push('/home');
        }
    }
};
</script>

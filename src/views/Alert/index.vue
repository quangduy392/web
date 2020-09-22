<template>
    <div>
        <header class="app-header navbar" style="position: relative !important">
            <div class="sub-header">
                <div class="sub-header-content" style="border-bottom: 1px solid rgb(42, 44, 46);">
                    <div class="subheader-left">
                        <b-navbar-nav class="ml-auto mr-md-5">
                            <b-nav-item to="event">EVENTS</b-nav-item>
                            <b-nav-item to="alert">ALERTS</b-nav-item>
                        </b-navbar-nav>
                    </div>
                </div>
            </div>
        </header>

        <router-view></router-view>
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
        ...mapActions({})
    }
};
</script>
<style lang="scss" scoped>
@import './scss/theme/styles';
</style>
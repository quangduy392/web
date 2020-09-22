<template>
    <div class="app">
        <AppHeader />
        <div class="app-body">
            <!-- Progress bar -->
            <!-- <div
                id="main-progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="100"
                class="progress-bar bg-info progress-bar-striped progress-bar-animated pt-1 w-100 fixed-top"
                :class="{
                    hide: !isShowLoading
                }"
            ></div>-->
            <main class="main h-100">
                <router-view :key="$route.path"></router-view>
            </main>
        </div>
    </div>
</template>

<script>
import { Header as AppHeader } from '../components/';
import { mapState } from 'vuex';

export default {
    name: 'full',
    components: {
        AppHeader
    },
    data() {
        return {};
    },
    computed: {
        ...mapState({
            isShowLoading: state => state.page.isShowLoading
        })
    }
};
</script>
<style lang="scss" scoped>
</style>

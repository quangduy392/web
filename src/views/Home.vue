<template>
    <div class="container-fluid text-center"></div>
</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';

export default {
    components: {},
    mounted: function() {
        this.$nextTick(async function() {
            this.onRouteChange();
        });
    },
    computed: {
        ...mapState({
            currentUserFunctions: state =>
                _.cloneDeep(_.get(state.auth, 'currentUser.userDetail.functions')),
            currentUser: state => state.auth.currentUser
        })
    },
    watch: {
        $route(val) {
            this.onRouteChange();
        }
    },
    methods: {
        getRouteList() {
            const selectingView = this.$route.query.view || this.currentUser.selectedView;
            const listNavItems = [];
            if (selectingView) {
                listNavItems.push(...this.$root.nav[selectingView].children);
            } else {
                Object.values(this.$root.nav).forEach(navItem => {
                    listNavItems.push(...navItem.children);
                });
            }
            return listNavItems;
        },
        getDefaultRoute() {
            const listNavItems = this.getRouteList();
            const result = _.find(listNavItems, ['isDefault', true]);
            return result;
        },
        getFirstValidUserFunction() {
            const listNavItems = this.getRouteList();

            let userFunctionList = [];
            listNavItems.forEach(navItem => {
                userFunctionList.push(...navItem.permissions);
            });
            userFunctionList = _.uniq(userFunctionList);

            let firstValidUserFunction = null;
            (this.currentUserFunctions || []).forEach(userFunc => {
                if (userFunctionList.indexOf(userFunc) > -1) {
                    firstValidUserFunction = userFunc;
                    return;
                }
            });
            return firstValidUserFunction;
        },
        onRouteChange() {
            const defaultRoute = this.getDefaultRoute();
            let hasPermissionForDefaltRoute = false;
            if (defaultRoute && defaultRoute.permissions && defaultRoute.permissions.length > 0) {
                defaultRoute.permissions.forEach(el => {
                    if (this.currentUserFunctions.indexOf(defaultRoute > -1)) {
                        hasPermissionForDefaltRoute = true;
                    }
                });
            }
            if (defaultRoute && hasPermissionForDefaltRoute) {
                this.$router.push(defaultRoute.url);
            } else {
                const func = this.getFirstValidUserFunction();
                switch (func) {
                    case 'user':
                        this.$router.push('/manage/user');
                        break;

                    case 'analyze':
                        this.$router.push('/analyze-case');
                        break;

                    case 'attendance':
                        this.$router.push('/attendance');
                        break;

                    case 'monitor':
                        this.$router.push('/alert');
                        break;

                    case 'report':
                        this.$router.push('/report');
                        break;

                    case 'manage':
                        this.$router.push('/manage');
                        break;
                }
            }
        }
    }
};
</script>

<template>
    <div class="sub-header">
        <div class="bg-gray-900">
            <div class="container-fluid">
                <b-row class="justify-content-between align-items-center">
                    <b-col>
                        <slot name="sub-header-left"> </slot>
                    </b-col>

                    <b-col class="text-middle">
                        <slot name="sub-header-middle">
                            <div style="color: yellow">
                                <div class="runtext" v-on="getBanner">
                                    <marquee-text :duration="speedBanner" :key="this.banner">
                                        <b>{{ this.banner }}</b>
                                    </marquee-text>
                                    <!-- <button @click="displayedMonitors()">
                                        CLICK
                                    </button> -->
                                </div>
                            </div>
                        </slot>
                    </b-col>
                    <!-- <b-col>
                        <breadcrumb
                            v-if="!hideBreadcrumb"
                            :list="
                                breadcrumbSubfix
                                    ? [...$route.matched.slice(0, -1), breadcrumbSubfix]
                                    : $route.matched
                            "
                            class="bg-transparent border-0 justify-content-center m-0"
                        />
                    </b-col> -->
                    <b-col class="text-right">
                        <slot name="sub-header-right"> </slot>
                    </b-col>
                </b-row>
            </div>
        </div>
        <div class="sub-header-bottom">
            <!---->
            <div class="sub-header-border-one"></div>
            <!---->
            <div class="sub-header-border-two"></div>
        </div>
    </div>
</template>

<script>
import Breadcrumb from './Breadcrumb';
import { mapActions, mapState } from 'vuex';
import changeAlias from '@/utils/changeAlias';
export default {
    name: 'sub-header',
    components: {
        Breadcrumb
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getMonitorList();
            // this.getTypeList();
            // this.displayedMonitors();
            this.refreshInterval = setInterval(this.getMonitorReportList, 5000);
            // this.bannerInterval = setInterval(this.getBanner(), 30000);
            this.getMonitorList();
        });
    },
    props: {
        hideBreadcrumb: {
            type: Boolean,
            default: false
        },
        breadcrumbSubfix: {
            type: String
        }
    },
    data: function() {
        return {
            refreshInterval: {},
            bannerInterval: {},
            displayedList: [],
            banner: '',
            show: true,
            speedBanner: '',
            countMess: 0
        };
    },
    computed: {
        ...mapState({
            monitorReports: state => state.monitorReport.items,
            monitors: state => state.monitor.allMonitors,
            localLang: state =>
                _.cloneDeep(_.get(state.auth, 'currentUser.userDetail.options.language'))
        }),
        // countRow() {
        //     return this.displayedMonitors.length;
        // },
        getBanner: function() {
            this.banner = '';
            this.speedBanner = '';
            this.countMess = 0;
            if (this.searchKeyword) {
                return this.monitors.filter(monitor => {
                    const keyword = changeAlias(this.searchKeyword.toLowerCase());
                    const monitorName = changeAlias(monitor.name.toLowerCase());
                    return monitorName.indexOf(keyword) > -1;
                });
            }
            this.monitors.map(monitor => {
                const monitorReport = this.monitorReports.find(
                    item => item.monitorId === monitor.id
                );
                if (monitorReport) {
                    monitor.fps = monitorReport.fps.toFixed(2);
                    monitor.error = monitorReport.error;
                    monitor.lastUpdated = monitorReport.updatedAt;
                    if (this.calTime(monitor.lastUpdated) > 300) {
                        monitor.message = '';
                        monitor.error = undefined;
                        monitor.fps = undefined;
                    } else {
                        if (!monitorReport.message) {
                            monitor.message = 'Bình thường';
                        } else {
                            monitor.message = monitorReport.message;
                        }
                    }
                } else {
                    monitor.message = 'Không chạy';
                }
                return monitor;
            });
            for (var i = 0; i < this.monitors.length; i++) {
                if (this.monitors[i].fps && this.monitors[i].error > 0) {
                    this.countMess += 1;
                    this.banner +=
                        '                     ' +
                        'Tiến trình ' +
                        this.monitors[i].name +
                        ' tại mục ' +
                        this.monitors[i].view +
                        ' có lỗi ' +
                        this.monitors[i].message;
                }
            }
            this.speedBanner = 15 * this.countMess;
            return this.banner;
        }
    },
    beforeDestroy() {
        this.banner = '';
        this.speedBanner = '';
        this.countMess = 0;
        clearInterval(this.refreshInterval);
        clearInterval(this.bannerInterval);
    },
    methods: {
        ...mapActions({
            getMonitorReportList: 'monitorReport/getMonitorReportList',
            getMonitorList: 'monitor/getAllMonitors'
        }),
        calTime(value) {
            var date = new Date(value);
            var seconds = date.getTime() / 1000;
            var agoSeconds = Date.now() / 1000 - seconds;
            return agoSeconds.toFixed(0);
        }
    }
};
</script>

<style lang="scss" scoped>
.runtext {
    min-width: 400px;
    max-width: 900px;
}
.fade-enter {
    opacity: 0;
}

.fade-enter-active {
    transition: opacity 0.5s;
}

.fade-leave {
    opacity: 1;
}

.fade-leave-active {
    transition: opacity 0.5s;
    opacity: 0;
}
.slide-enter {
    opacity: 0;
}

.slide-enter-active {
    transition: opacity 1s;
    animation: slide-in 1s ease-out forwards;
}

.slide-leave {
}

.slide-leave-active {
    opacity: 0;
    animation: slide-out 1s ease-out forwards;
}

/* kEY FRAME*/

@keyframes slide-in {
    from {
        transform: translateX(30px);
    }
    to {
        transform: translateX(0px);
    }
}
@keyframes slide-out {
    from {
        transform: translateX(0px);
    }
    to {
        transform: translateX(30px);
    }
}
</style>

<template>
    <div class="animated fadeIn h-100">
        <sub-header :breadcrumbSubfix="report.name">
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/report">{{ $t('report.list') }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <b-button
                    variant="outline-primary"
                    class="bg-none"
                    @click="openDialogUpdateTemplate"
                    v-if="isUpdateable"
                >
                    <i class="fa fa-arrow-circle-up" aria-hidden="true"></i>
                    {{ $t('report.updateTemplate') }}
                </b-button>
            </template>
        </sub-header>
        <div class="page-content sub-header-page-content py-0 px-1">
            <div class="d-flex h-100">
                <div class="pl-3 mr-1 h-100 overflow-hidden pb-2 flex-1 d-flex flex-column">
                    <BTemplate
                        :videoObjects="fiteredVideoObjects"
                        :filterClasses="filterClasses"
                        :filterColors="filterColors"
                        :report="report"
                        class="overflow-y-scroll overflow-x-hidden"
                        :caseVideos="caseVideos"
                        v-if="fiteredVideoObjects.length && report.template"
                    />
                    <div
                        v-if="isShowLoading"
                        class="h-100 d-flex flex-column justify-content-center align-items-center"
                    >
                        <img src="/static/img/loader-green.gif" class="standalone-loading" />
                    </div>
                </div>
                <div class="case-detail_sidebar h-100">
                    <objects-filter-sidebar
                        v-model="filterCondition"
                        :items="videoObjects"
                        :caseId="report.caseId"
                        :filterClasses="filterClasses"
                        :filterColors="filterColors"
                        @doFilter="doFilter"
                    />
                </div>
            </div>
        </div>
        <!-- the modal -->
        <!-- update report modal -->
        <b-modal
            ref="updateReportModal"
            :title="$t('report.preview')"
            @ok="updateTemplate"
            size="xl"
            dialog-class="h-90 mw-98"
            content-class="h-100"
            body-class="overflow-y-auto pr-0 pt-1 pb-0 overflow-x-hidden"
            :ok-title="$t('common.update')"
            :cancel-title="$t('common.cancel')"
            id="update-report-modal"
        >
            <BTemplate
                :videoObjects="fiteredVideoObjects"
                :filterClasses="filterClasses"
                :filterColors="filterColors"
                :report="newReport"
                :caseVideos="caseVideos"
            />
        </b-modal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import BTemplate from '@/components/Report/Template';
import _ from 'lodash';
import getObjectTime from '@/utils/getObjectTime';
import ObjectsFilterSidebar from '@/components/ObjectsFilterSidebar';

export default {
    components: { BTemplate, ObjectsFilterSidebar },
    mounted: function() {
        this.$nextTick(async () => {
            await this.getReportInfo({ id: this.$route.params.id });
            this.getCaseVideoListFull({
                caseId: this.report.caseId
            }).then(async caseVideos => {
                this.caseVideos = caseVideos;
                this.objectsByVideo = await Promise.all(
                    caseVideos.map(caseVideo => {
                        return this.getVideoObjectList({
                            endpointSubfix: caseVideo.videoId
                        });
                    })
                );
                this.isShowLoading = false;
                const objects = [];
                const filterClasses = [];
                const filterColors = [];
                for (const index in caseVideos) {
                    const { video } = caseVideos[index];
                    objects.push(
                        ...this.objectsByVideo[index].map(object => {
                            if (object.class) {
                                filterClasses.push(object.class);
                            }
                            if (object.colors && object.colors.length > 0) {
                                filterColors.push(...object.colors);
                            }
                            return { ...object, video, caseId: this.report.caseId };
                        })
                    );
                }
                this.filterClasses = _.uniq(filterClasses);
                this.filterColors = _.sortBy(_.uniq(filterColors));
                this.videoObjects = _.each(objects, object => {
                    object.fullTime = getObjectTime(object);
                    object.shortTime = getObjectTime(object).format('HH:mm');
                });
            });
            await this.checkUpdate();
        });
    },
    data: function() {
        return {
            objectsByVideo: [],
            videoObjects: [],
            filterClasses: [],
            filterColors: [],
            filterCondition: {},
            fiteredVideoObjects: [],
            caseVideos: [],
            isUpdateable: false,
            curTemplate: {},
            newReport: {},
            isShowLoading: true
        };
    },
    computed: {
        ...mapState({
            report: state => state.report.item
        })
    },
    methods: {
        ...mapActions({
            getReportInfo: 'report/getReportInfo',
            getTemplate: 'report/getTemplate',
            updateReport: 'report/updateReport',
            resetCaseVideoData: 'caseVideo/resetData',
            getCaseVideoListFull: 'caseVideo/getListFull',
            getVideoObjectList: 'videoObject/getList'
        }),
        doFilter(value) {
            this.fiteredVideoObjects = value;
        },
        async checkUpdate() {
            this.curTemplate = await this.getTemplate({ id: this.report.templateId });
            if (JSON.stringify(this.curTemplate.content) !== JSON.stringify(this.report.template)) {
                this.isUpdateable = true;
                this.newReport = _.cloneDeep(this.report);
                this.newReport.template = this.curTemplate.content;
            } else this.isUpdateable = false;
        },
        openDialogUpdateTemplate() {
            this.$refs.updateReportModal.show();
        },
        async updateTemplate() {
            await this.updateReport(this.newReport);
            this.$toaster.success(this.$t('report.updateTemplateSuccessMsg'));
            await this.getReportInfo({ id: this.$route.params.id });
            this.isUpdateable = false;
        }
    }
};
</script>

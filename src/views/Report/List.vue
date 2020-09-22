<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/report">{{ $t('cases.cases') }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <!-- <b-button variant="outline-primary" class="bg-none mr-1" @click="gotoCreateTemplate">
                    <i class="fa fa-plus-circle" aria-hidden="true"></i>
                    TẠO MẪU BÁO CÁO
                </b-button>-->
                <b-button variant="outline-primary" class="bg-none" @click="openCreateReportModal">
                    <i class="fa fa-plus-circle" aria-hidden="true"></i>
                    {{ $t('report.create') }}
                </b-button>
            </template>
        </sub-header>
        <div class="page-content sub-header-page-content py-3 px-4">
            <b-row>
                <b-col
                    cols="12"
                    md="4"
                    lg="3"
                    xl="2"
                    v-for="report in listReport"
                    :key="report.id"
                    class="mb-4 mb-xl-2 px-xl-1"
                >
                    <ReportItem
                        :report="report"
                        @editReport="openUpdateItemModal(report)"
                        @deleteReport="openDeleteReportModal(report)"
                    />
                </b-col>
            </b-row>
            <div
                v-if="isShowLoading"
                class="h-100 d-flex flex-column justify-content-center align-items-center"
            >
                <img src="/static/img/loader-green.gif" class="standalone-loading" />
            </div>
            <!-- the modal -->
            <!-- update report modal -->
            <b-modal
                ref="updateReportModal"
                :title="$t('report.updateReport')"
                no-close-on-esc
                no-close-on-backdrop
                @ok="handleUpdateReportOk"
                :ok-title="$t('common.update')"
                :cancel-title="$t('common.cancel')"
            >
                <form @submit.prevent="submitUpdateReportForm">
                    <b-form-group :label="$t('report.title')">
                        <b-form-input
                            maxlength="255"
                            v-model.trim="selectedItem.name"
                            :placeholder="$t('report.title')"
                            name="name"
                            v-validate="'required'"
                            :data-vv-as="$t('report.title')"
                        ></b-form-input>
                        <div v-show="errors.has('name')" class="validation-message text-danger">
                            {{ errors.first('name') }}
                        </div>
                    </b-form-group>

                    <b-form-group :label="`${$t('common.description')} ${$t('common.optional')}`">
                        <b-form-textarea
                            id="textarea"
                            maxlength="255"
                            v-model="selectedItem.desc"
                            :placeholder="$t('common.description')"
                            rows="3"
                            max-rows="6"
                        ></b-form-textarea>
                    </b-form-group>
                </form>
            </b-modal>

            <!-- Delete confirmation -->
            <b-modal
                ref="deleteReportModal"
                :title="$t('common.confirmation')"
                no-close-on-esc
                no-close-on-backdrop
                @ok="handleDeleteReportOk"
                :ok-title="$t('common.delete')"
                :cancel-title="$t('common.cancel')"
                ok-variant="danger"
                >{{ $t('report.deleteConfirmMsg') }}</b-modal
            >

            <!-- createReportModal -->
            <b-modal
                ref="createReportModal"
                :title="addReportSteps[addReportCurrentStep - 1]"
                no-close-on-esc
                no-close-on-backdrop
                dialog-class="h-90"
                content-class="h-100"
                body-class="overflow-auto"
                size="xl"
            >
                <ChooseTemplate
                    v-show="addReportCurrentStep == 1"
                    @updateSelectedTemplates="updateSelectedTemplate"
                />
                <ChooseCase
                    v-show="addReportCurrentStep == 2"
                    @updateSelectedCases="updateSelectedCases"
                />
                <div v-show="addReportCurrentStep === 3" class="h-100">
                    <form @submit.prevent="submitCreateReportForm">
                        <b-form-group :label="$t('report.name')">
                            <b-form-input
                                maxlength="255"
                                :placeholder="$t('report.name')"
                                name="name"
                                v-model.trim="report.name"
                                v-validate="'required'"
                                :data-vv-as="$t('report.name')"
                            ></b-form-input>
                            <div v-show="errors.has('name')" class="validation-message text-danger">
                                {{ errors.first('name') }}
                            </div>
                        </b-form-group>

                        <b-form-group
                            :label="`${$t('common.description')} ${$t('common.optional')}`"
                        >
                            <b-form-textarea
                                id="textarea"
                                maxlength="255"
                                v-model.trim="report.desc"
                                :placeholder="$t('common.description')"
                                rows="3"
                                max-rows="6"
                            ></b-form-textarea>
                        </b-form-group>
                    </form>
                </div>
                <template slot="modal-footer">
                    <b-row class="w-100">
                        <b-col cols="4" offset="4">
                            <vue-step
                                :now-step="addReportCurrentStep"
                                :step-list="addReportSteps"
                            ></vue-step>
                        </b-col>

                        <b-col cols="4">
                            <div class="d-flex align-items-center justify-content-end h-100">
                                <b-button
                                    class="mr-3"
                                    @click="jumbStep(-1)"
                                    :disabled="!isBackable()"
                                    >{{ $t('common.back') }}</b-button
                                >
                                <b-button
                                    variant="primary"
                                    @click="jumbStep(1)"
                                    :disabled="!isNextable()"
                                    v-if="addReportCurrentStep < addReportSteps.length"
                                    >{{ $t('common.next') }}</b-button
                                >

                                <b-button
                                    variant="primary"
                                    v-if="addReportCurrentStep == addReportSteps.length"
                                    @click="submitCreateReportForm"
                                    >{{ $t('report.createReport') }}</b-button
                                >
                            </div>
                        </b-col>
                    </b-row>
                </template>
            </b-modal>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import vueStep from 'vue-step';
import ChooseTemplate from '@/components/Report/ChooseTemplate';
import ChooseCase from '@/components/Report/ChooseCase';
import ReportItem from '@/components/Report/ReportItem';
export default {
    components: { vueStep, ChooseTemplate, ChooseCase, ReportItem },
    mounted: function() {
        this.$nextTick(async () => {
            await this.getList();
            this.isShowLoading = false;
        });
    },
    data: function() {
        return {
            addReportCurrentStep: 1,
            selectedTemplateSource: [],
            selectedCaseSource: [],
            report: {
                name: '',
                desc: ''
            },
            selectedItem: {},
            isShowLoading: true
        };
    },
    computed: {
        ...mapState({
            listReport: state => state.report.items
        }),
        addReportSteps() {
            return [
                this.$t('report.selectTemplate'),
                this.$t('report.selectCase'),
                this.$t('report.inputInfo')
            ];
        }
    },
    watch: {
        selectedCaseSource() {
            if (this.selectedCaseSource.length) {
                this.report.name = this.selectedCaseSource[0].name;
            }
        }
    },
    methods: {
        ...mapActions({
            createReport: 'report/createReport',
            getList: 'report/getList',
            getReportInfo: 'report/getReportInfo',
            deleteReport: 'report/deleteReport',
            updateReport: 'report/updateReport'
        }),
        openCreateReportModal() {
            this.addReportCurrentStep = 1;
            this.selectedTemplateSource = [];
            this.selectedCaseSource = [];
            this.$refs.createReportModal.show();
        },
        jumbStep(offset = 1) {
            this.addReportCurrentStep += offset;
        },
        isBackable() {
            return this.addReportCurrentStep > 1;
        },
        isNextable() {
            let isNextable = this.addReportCurrentStep < this.addReportSteps.length;
            if (this.addReportCurrentStep === 1) {
                isNextable = isNextable && this.selectedTemplateSource.length > 0;
            } else if (this.addReportCurrentStep === 2) {
                isNextable = isNextable && this.selectedCaseSource.length > 0;
            }
            return isNextable;
        },
        updateSelectedTemplate(selectedTemplates) {
            this.selectedTemplateSource = selectedTemplates;
        },
        updateSelectedCases(selectedCases) {
            this.selectedCaseSource = selectedCases;
        },
        submitCreateReportForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.createReport({
                        ...this.report,
                        templateId: this.selectedTemplateSource[0].id,
                        template: this.selectedTemplateSource[0].content,
                        caseId: this.selectedCaseSource[0].id
                    }).then(() => {
                        this.$refs.createReportModal.hide();
                        this.getList();
                        this.$toaster.success(this.$t('report.createReportSuccessMsg'));
                    });
                }
            });
        },
        openUpdateItemModal(item) {
            this.selectedItem = item ? _.cloneDeep(item) : {};
            this.$refs.updateReportModal.show();
        },
        handleUpdateReportOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.submitUpdateReportForm();
        },
        submitUpdateReportForm: function() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.updateReport(this.selectedItem).then(() => {
                        this.$refs.updateReportModal.hide();
                        this.getList();
                        this.$toaster.success(this.$t('report.updateReportSuccessMsg'));
                    });
                }
            });
        },
        openDeleteReportModal(item) {
            if (!item) return;
            this.selectedItem = item;
            this.$refs.deleteReportModal.show();
        },
        handleDeleteReportOk(modal) {
            // Prevent modal from closing
            modal.preventDefault();
            // Trigger submit handler
            this.deleteReport(this.selectedItem).then(() => {
                this.$refs.deleteReportModal.hide();
                this.getList();
                this.$toaster.success(this.$t('report.deleteReportSuccessMsg'));
            });
        },
        gotoCreateTemplate() {
            this.$router.push('/report/create-template');
        }
    }
};
</script>
<style lang="scss" scoped>
.report-template-image {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    overflow: hidden;
}
</style>

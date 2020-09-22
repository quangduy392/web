<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/management/manage/camera" class="text-nowrap"
                        >CAMERA</b-nav-item
                    >
                    <b-nav-item to="/management/manage/holiday" class="text-nowrap">{{
                        $t('holiday.pageTitle')
                    }}</b-nav-item>
                    <b-nav-item to="/management/manage/configuration" class="text-nowrap">{{
                        $t('configuration.pageTitle')
                    }}</b-nav-item>
                    <b-nav-item to="/management/manage/vms">VMS</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content p-4" ref="countBody">
            <b-table
                striped
                hover
                dark
                :items="listConfiguration"
                :fields="fields"
                show-empty
                :current-page="currentPage"
                :per-page="perPage"
            >
                <template slot="index" slot-scope="data">{{
                    (currentPage - 1) * perPage + (data.index + 1)
                }}</template>
                <template slot="createdAt" slot-scope="data">
                    <span>{{ data.value | formatDateTime }}</span>
                </template>
                <template slot="actions" slot-scope="row">
                    <b-button
                        class="min-width-none"
                        variant="light"
                        v-b-tooltip.hover
                        :title="$t('alert.attribute')"
                        @click="openParamModal(row.item.id)"
                    >
                        <i class="fa fa-sliders"></i>
                    </b-button>
                </template>
                <template slot="empty">
                    <div class="text-center">
                        <span>{{ $t('configuration.empty') }}</span>
                    </div>
                </template>
            </b-table>
            <div v-if="countRow > perPage" class="my-1">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="countRow"
                    :per-page="perPage"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
        </div>

        <!-- Create/Edit Info -->
        <b-modal
            ref="createOrUpdateModal"
            :ok-title="`${itemInfo.id ? $t('common.update') : $t('common.create')}`"
            :title="`${itemInfo.id ? $t('configuration.update') : $t('configuration.create')}`"
            :cancel-title="$t('common.cancel')"
            @ok="handleCreateOk"
            no-close-on-esc
            no-close-on-backdrop
        >
            <b-form-group :label="$t('configuration.name')">
                <b-form-input
                    maxlength="255"
                    v-model="itemInfo.name"
                    v-validate="'required'"
                    :placeholder="$t('configuration.name')"
                    name="name"
                    :data-vv-as="$t('configuration.name')"
                ></b-form-input>
                <div v-show="errors.has('name')" class="validation-message text-danger">
                    {{ errors.first('name') }}
                </div>
            </b-form-group>
        </b-modal>

        <!-- Edit Configuration Params -->
        <b-modal
            ref="configurationParamsModal"
            :ok-title="$t('common.update')"
            :title="$t('configuration.configuration')"
            :cancel-title="$t('common.cancel')"
            @ok="handleCreateOk"
            no-close-on-esc
            no-close-on-backdrop
            body-class="scroll-modal-body"
        >
            <b-form-group :label="$t('configuration.workTimeMorning')" label-cols="6">
                <b-row>
                    <b-col>
                        <date-picker
                            v-model="startTimeMorning"
                            format="HH:mm"
                            class="w-100"
                            inputClass="form-control bg-white"
                            popupClass="timepicker-popup"
                            type="time"
                            value-type="format"
                            :clearable="false"
                        >
                            <span slot="icon-calendar"></span>
                        </date-picker>
                    </b-col>
                    <div class="text-center align-self-center">~</div>
                    <b-col>
                        <date-picker
                            v-model="endTimeMorning"
                            format="HH:mm"
                            class="w-100"
                            inputClass="form-control bg-white"
                            popupClass="timepicker-popup"
                            type="time"
                            value-type="format"
                            :clearable="false"
                        >
                            <span slot="icon-calendar"></span>
                        </date-picker>
                    </b-col>
                </b-row>
            </b-form-group>
            <b-form-group :label="$t('configuration.workTimeAfternoon')" label-cols="6">
                <b-row>
                    <b-col>
                        <date-picker
                            v-model="startTimeAfternoon"
                            format="HH:mm"
                            class="w-100"
                            inputClass="form-control bg-white"
                            popupClass="timepicker-popup"
                            type="time"
                            value-type="format"
                            :clearable="false"
                        >
                            <span slot="icon-calendar"></span>
                        </date-picker>
                    </b-col>
                    <div class="text-center align-self-center">~</div>
                    <b-col>
                        <date-picker
                            v-model="endTimeAfternoon"
                            format="HH:mm"
                            class="w-100"
                            inputClass="form-control bg-white"
                            popupClass="timepicker-popup"
                            type="time"
                            value-type="format"
                            :clearable="false"
                        >
                            <span slot="icon-calendar"></span>
                        </date-picker>
                    </b-col>
                </b-row>
            </b-form-group>
            <b-form-group :label="$t('configuration.timeDisplayFace')" label-cols="6">
                <b-input-group :append="$t('common.hour')">
                    <b-form-input
                        type="number"
                        v-model="itemInfo.objectValue.EVENT_MAX_TIME_DISPLAY"
                        v-validate="'numeric'"
                        name="timeDisplayFace"
                        :data-vv-as="$t('configuration.timeDisplayFace')"
                    />
                </b-input-group>
                <span class="validation-message text-danger">
                    {{ errors.first('timeDisplayFace') }}
                </span>
            </b-form-group>
            <b-form-group :label="$t('configuration.timeReloadImgUrl')" label-cols="6">
                <b-input-group :append="$t('common.second')">
                    <b-form-input
                        type="number"
                        v-model="itemInfo.objectValue.CAM_LIVE_RELOAD_URL"
                        v-validate="'numeric'"
                        name="timeReloadImgUrl"
                        :data-vv-as="$t('configuration.timeReloadImgUrl')"
                    />
                </b-input-group>
                <span class="validation-message text-danger">
                    {{ errors.first('timeReloadImgUrl') }}
                </span>
            </b-form-group>
            <b-form-group :label="$t('configuration.timeFetchEvent')" label-cols="6">
                <b-input-group :append="$t('common.second')">
                    <b-form-input
                        type="number"
                        v-model="itemInfo.objectValue.ATTENDANCE_FACE_INTERVAL"
                        v-validate="'numeric'"
                        name="timeFetchEvent"
                        :data-vv-as="$t('configuration.timeFetchEvent')"
                    />
                </b-input-group>
                <span class="validation-message text-danger">
                    {{ errors.first('timeFetchEvent') }}
                </span>
            </b-form-group>
            <b-form-group :label="$t('configuration.timeFetchListRoom')" label-cols="6">
                <b-input-group :append="$t('common.second')">
                    <b-form-input
                        type="number"
                        v-model="itemInfo.objectValue.ATTENDANCE_EVENT_INTERVAL"
                        v-validate="'numeric'"
                        name="timeFetchListRoom"
                        :data-vv-as="$t('configuration.timeFetchListRoom')"
                    />
                </b-input-group>
                <span class="validation-message text-danger">
                    {{ errors.first('timeFetchListRoom') }}
                </span>
            </b-form-group>
            <b-form-group :label="$t('configuration.timeRecallApiReception')" label-cols="6">
                <b-input-group :append="$t('common.second')">
                    <b-form-input
                        type="number"
                        v-model="itemInfo.objectValue.RECEPTION_INTERVAL"
                        v-validate="'numeric'"
                        name="timeRecallApiReception"
                        :data-vv-as="$t('configuration.timeRecallApiReception')"
                    />
                </b-input-group>
                <span class="validation-message text-danger">
                    {{ errors.first('timeRecallApiReception') }}
                </span>
            </b-form-group>
        </b-modal>

        <!-- Confirm Delete -->
        <!-- <b-modal
            ref="deleteModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDelete"
        >{{ $t('configuration.deleteConfirmMsg') }}</b-modal>-->
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {
    components: {
        DatePicker
    },
    mounted: function() {
        this.$nextTick(function() {
            this.getList().then(response => {
                if (response.length && response.some(item => item.name === 'Web Parameters')) {
                    this.listConfiguration = response;
                } else {
                    this.add();
                    this.listConfiguration = this.items;
                }
                this.updatePerPage();
            });
        });
    },
    computed: {
        ...mapState({
            items: state => state.configuration.items,
            item: state => state.configuration.item,
            localLang: state =>
                _.cloneDeep(_.get(state.auth, 'currentUser.userDetail.options.language'))
        }),
        fields() {
            return [
                { tdClass: 'align-middle', key: 'index', label: '#' },
                { tdClass: 'align-middle', key: 'name', label: this.$t('common.name') },
                {
                    tdClass: 'align-middle',
                    key: 'createdAt',
                    label: this.$t('common.lastCreated')
                },
                {
                    thClass: 'configuration-actions-col',
                    key: 'actions',
                    label: this.$t('common.actions')
                }
            ];
        },
        countRow() {
            return this.listConfiguration.length;
        }
    },
    data() {
        return {
            itemInfo: {
                name: 'Web Parameters',
                objectValue: {}
            },
            currentId: null,
            currentPage: 1,
            perPage: 15,
            listConfiguration: [],
            startTimeMorning: null,
            startTimeAfternoon: null,
            endTimeMorning: null,
            endTimeAfternoon: null
        };
    },
    methods: {
        ...mapActions({
            getList: 'configuration/getList',
            updateOrCreate: 'configuration/updateOrCreate',
            deleteById: 'configuration/delete',
            getInfo: 'configuration/getInfo'
        }),
        handleCreateOk(modal) {
            modal.preventDefault();
            this.onSubmit();
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.itemInfo.id) {
                        this.update();
                    } else {
                        // this.add();
                    }
                    this.$refs.createOrUpdateModal.hide();
                    this.$refs.configurationParamsModal.hide();
                    this.$toaster.success(
                        `${
                            this.item.id
                                ? this.$i18n.t('common.update')
                                : this.$i18n.t('common.create')
                        } ${this.$i18n.t('configuration.holidaySuccess')}`
                    );
                }
            });
        },
        async add() {
            delete this.itemInfo.id;
            await this.updateOrCreate(this.itemInfo);
        },
        // async showUpdateModal(id) {
        //     this.resetForm();
        //     await this.getInfo({ id: id });
        //     this.itemInfo = { ...this.item };
        //     this.$refs.createOrUpdateModal.show();
        // },
        async update() {
            const startTimeMorning = this.startTimeMorning.split(':');
            this.itemInfo.objectValue.MORNING_WORK_TIME_START_HOUR = startTimeMorning[0];
            this.itemInfo.objectValue.MORNING_WORK_TIME_START_MINUTES = startTimeMorning[1];

            const endTimeMorning = this.endTimeMorning.split(':');
            this.itemInfo.objectValue.MORNING_WORK_TIME_END_HOUR = endTimeMorning[0];
            this.itemInfo.objectValue.MORNING_WORK_TIME_END_MINUTES = endTimeMorning[1];

            const startTimeAfternoon = this.startTimeAfternoon.split(':');
            this.itemInfo.objectValue.AFTERNOON_WORK_TIME_START_HOUR = startTimeAfternoon[0];
            this.itemInfo.objectValue.AFTERNOON_WORK_TIME_START_MINUTES = startTimeAfternoon[1];

            const endTimeAfternoon = this.endTimeAfternoon.split(':');
            this.itemInfo.objectValue.AFTERNOON_WORK_TIME_END_HOUR = endTimeAfternoon[0];
            this.itemInfo.objectValue.AFTERNOON_WORK_TIME_END_MINUTES = endTimeAfternoon[1];

            this.itemInfo.objectValue.CAM_LIVE_RELOAD_URL =
                this.itemInfo.objectValue.CAM_LIVE_RELOAD_URL * 1000;
            this.itemInfo.objectValue.ATTENDANCE_FACE_INTERVAL =
                this.itemInfo.objectValue.ATTENDANCE_FACE_INTERVAL * 1000;
            this.itemInfo.objectValue.ATTENDANCE_EVENT_INTERVAL =
                this.itemInfo.objectValue.ATTENDANCE_EVENT_INTERVAL * 1000;
            this.itemInfo.objectValue.RECEPTION_INTERVAL =
                this.itemInfo.objectValue.RECEPTION_INTERVAL * 1000;
            this.itemInfo.objectValue.EVENT_MAX_TIME_DISPLAY =
                this.itemInfo.objectValue.EVENT_MAX_TIME_DISPLAY * 3600 * 1000;

            for (const param in this.itemInfo.objectValue) {
                this.itemInfo.objectValue[param] = parseInt(this.itemInfo.objectValue[param]);
            }
            await this.updateOrCreate(this.itemInfo);
        },
        // async onDelete(modal) {
        //     modal.preventDefault();
        //     await this.deleteById({ id: this.currentId });
        //     if (this.items.length / this.perPage === this.currentPage - 1) {
        //         this.currentPage--;
        //     }
        //     this.$refs.deleteModal.hide();
        //     this.$toaster.success(this.$i18n.t('configuration.deleteMess'));
        // },
        // async confirmDelete(zoneId) {
        //     this.currentId = zoneId;
        //     this.$refs.deleteModal.show();
        // },
        resetForm() {
            this.itemInfo = {
                name: 'Web Parameters',
                objectValue: {}
            };
        },
        onWindowSizeChange(e) {
            this.updatePerPage();
        },
        updatePerPage() {
            this.perPage = Math.floor(this.$refs.countBody.clientHeight / 57) - 2;
        },
        async openParamModal(id) {
            this.resetForm();
            await this.getInfo({ id: id });
            this.itemInfo = _.cloneDeep(this.item);
            this.itemInfo.objectValue.CAM_LIVE_RELOAD_URL =
                this.itemInfo.objectValue.CAM_LIVE_RELOAD_URL / 1000;
            this.itemInfo.objectValue.ATTENDANCE_FACE_INTERVAL =
                this.itemInfo.objectValue.ATTENDANCE_FACE_INTERVAL / 1000;
            this.itemInfo.objectValue.ATTENDANCE_EVENT_INTERVAL =
                this.itemInfo.objectValue.ATTENDANCE_EVENT_INTERVAL / 1000;
            this.itemInfo.objectValue.RECEPTION_INTERVAL =
                this.itemInfo.objectValue.RECEPTION_INTERVAL / 1000;
            this.itemInfo.objectValue.EVENT_MAX_TIME_DISPLAY =
                this.itemInfo.objectValue.EVENT_MAX_TIME_DISPLAY / (3600 * 1000);

            this.startTimeMorning = this.$moment()
                .hour(this.itemInfo.objectValue.MORNING_WORK_TIME_START_HOUR)
                .minute(this.itemInfo.objectValue.MORNING_WORK_TIME_START_MINUTES)
                .format('HH:mm');
            this.endTimeMorning = this.$moment()
                .hour(this.itemInfo.objectValue.MORNING_WORK_TIME_END_HOUR)
                .minute(this.itemInfo.objectValue.MORNING_WORK_TIME_END_MINUTES)
                .format('HH:mm');
            this.startTimeAfternoon = this.$moment()
                .hour(this.itemInfo.objectValue.AFTERNOON_WORK_TIME_START_HOUR)
                .minute(this.itemInfo.objectValue.AFTERNOON_WORK_TIME_START_MINUTES)
                .format('HH:mm');
            this.endTimeAfternoon = this.$moment()
                .hour(this.itemInfo.objectValue.AFTERNOON_WORK_TIME_END_HOUR)
                .minute(this.itemInfo.objectValue.AFTERNOON_WORK_TIME_END_MINUTES)
                .format('HH:mm');
            this.$refs.configurationParamsModal.show();
        }
    },
    created() {
        window.addEventListener('resize', this.onWindowSizeChange);
    },
    destroyed() {
        window.removeEventListener('resize', this.onWindowSizeChange);
    }
};
</script>
<style>
.scroll-modal-body {
    max-height: 70vh;
    overflow: auto;
}
.timepicker-popup {
    z-index: 9999 !important;
}
</style>

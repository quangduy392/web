<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/alert/manage/profile" class="text-nowrap">{{
                        $t('alert.manage.profile')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/thief" class="text-nowrap">{{
                        $t('alert.manage.thief')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/stranger" class="text-nowrap">{{
                        $t('attendanceCommon.manage.stranger')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/region" class="text-nowrap">{{
                        $t('alert.manage.region')
                    }}</b-nav-item>
                    <b-nav-item to="/alert/manage/monitor" class="text-nowrap">{{
                        $t('alert.manage.monitor')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
            <template slot="sub-header-right">
                <div class="d-flex justify-content-end align-items-center">
                    <div class="input-group border-bottom position-relative" style="width: 190px;">
                        <input
                            type="text"
                            class="form-control bg-transparent border-none text-white pr-4"
                            :placeholder="$t('common.search')"
                            aria-label="Search"
                            aria-describedby="button-addon2"
                            v-model="searchKeyword"
                            style="min-width: 190px;"
                        />
                        <i
                            class="fa fa-search position-absolute"
                            aria-hidden="true"
                            style="top: 50%;right: 4px;margin-top: -6px;"
                        ></i>
                    </div>
                    <div class="text-white mx-3 font-20">|</div>
                    <div class="d-flex align-items-center text-nowrap">
                        <b-button variant="outline-primary" @click="openCreateModal">
                            <i class="fa fa-plus-circle mr-2"></i>
                            <span class="text-uppercase">{{ $t('zone.createZone') }}</span>
                        </b-button>
                    </div>
                </div>
            </template>
        </sub-header>

        <div class="page-content sub-header-page-content p-4" ref="reportBody">
            <b-table
                striped
                hover
                dark
                :items="searchResults"
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
                        variant="primary"
                        class="mr-1 min-width-none"
                        @click="showUpdateCameraModal(row.item.id)"
                        v-b-tooltip.hover
                        title="Chọn camera"
                    >
                        <i class="fa fa-video-camera"></i>
                    </b-button>
                    <b-button
                        variant="primary"
                        class="mr-1 min-width-none"
                        @click="showUpdateZoneModal(row.item.id)"
                        v-b-tooltip.hover
                        :title="$t('common.edit')"
                    >
                        <i class="fa fa-pencil"></i>
                    </b-button>
                    <b-button
                        variant="danger"
                        @click="confirmDelete(row.item.id)"
                        v-b-tooltip.hover
                        class="min-width-none"
                        :title="$t('common.delete')"
                    >
                        <i class="fa fa-trash"></i>
                    </b-button>
                </template>
                <template slot="empty">
                    <div class="text-center">
                        <span>{{ $t('zone.empty') }}</span>
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

        <!-- Create/Edit Zone Info -->
        <b-modal
            ref="createOrUpdateZoneModal"
            :ok-title="`${zoneInfo.id ? $t('common.update') : $t('common.create')}`"
            :title="`${zoneInfo.id ? $t('zone.updateZone') : $t('zone.createZone')}`"
            :cancel-title="$t('common.cancel')"
            @ok="handleCreateZoneOk"
            no-close-on-esc
            no-close-on-backdrop
        >
            <b-form-group :label="$t('zone.zoneName')">
                <b-form-input
                    maxlength="255"
                    v-model="zoneInfo.name"
                    v-validate="'required'"
                    :placeholder="$t('zone.zoneName')"
                    name="zoneName"
                    :data-vv-as="$t('zone.zoneName')"
                ></b-form-input>
                <div v-show="errors.has('zoneName')" class="validation-message text-danger">
                    {{ errors.first('zoneName') }}
                </div>
            </b-form-group>
        </b-modal>
        <!-- Update Camera Zone modal -->
        <b-modal
            ref="updateCameraModal"
            title="Chọn camera"
            ok-title="Đóng"
            ok-variant="secondary"
            no-close-on-esc
            no-close-on-backdrop
            ok-only
            scrollable
        >
            <table class="table b-table table-striped table-dark table-bordered mb-0">
                <tbody>
                    <tr v-for="camera in cameras">
                        <td style="height: 30px">{{ camera.name }}</td>
                        <td class="text-center">
                            <label class="form-checkbox" style="margin-bottom: 0px;">
                                <input
                                    type="checkbox"
                                    :value="camera.id"
                                    v-model="cameraSelected"
                                    style="transform : scale(1.5)"
                                    @change="onChangeCamera(camera.id)"
                                />
                            </label>
                        </td>
                    </tr>
                </tbody>
            </table>
        </b-modal>

        <!-- Confirm Delete Zone -->
        <b-modal
            ref="deleteZoneModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDeleteZone"
            >{{ $t('zone.deleteConfirmMsg') }}</b-modal
        >
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import changeAlias from '@/utils/changeAlias';

export default {
    components: {},
    mounted: function() {
        this.$nextTick(function() {
            this.getListZones();
            this.updatePerPage();
            this.getCameraList();
        });
    },
    computed: {
        ...mapState({
            listZones: state => state.zone.items,
            zone: state => state.zone.item,
            cameras: state => state.camera.items
        }),
        countRow() {
            return this.searchResults.length;
        },
        searchResults() {
            if (this.searchKeyword) {
                return this.listZones.filter(zone => {
                    const keyword = changeAlias(this.searchKeyword.toLowerCase());
                    const zoneName = changeAlias(zone.name.toLowerCase());
                    return zoneName.indexOf(keyword) > -1;
                });
            }
            return this.listZones;
        }
    },
    data() {
        return {
            fields: [
                { tdClass: 'align-middle indexCol', key: 'index', label: '#' },
                { tdClass: 'align-middle', key: 'name', label: this.$i18n.t('common.name') },
                {
                    tdClass: 'align-middle',
                    key: 'createdAt',
                    label: this.$i18n.t('common.lastCreated')
                },
                {
                    thClass: 'region-action-col',
                    key: 'actions',
                    label: this.$i18n.t('common.actions')
                }
            ],
            zoneInfo: {},
            currentZoneId: null,
            currentPage: 1,
            perPage: 15,
            cameraSelected: [],
            searchKeyword: null
        };
    },
    methods: {
        ...mapActions({
            getListZones: 'zone/getListZones',
            createNewZone: 'zone/createNewZone',
            updateZoneInfo: 'zone/updateZoneInfo',
            deleteZoneById: 'zone/deleteZoneById',
            getZoneInfo: 'zone/getZoneInfo',
            getCameraList: 'camera/getList',
            getListZoneCamera: 'zone/getListZoneCamera',
            addZoneCamera: 'zone/addZoneCamera',
            deleteZoneCamera: 'zone/deleteZoneCamera'
        }),
        handleCreateZoneOk(modal) {
            modal.preventDefault();
            this.onSubmit();
        },
        handleUpdateCameraOk(modal) {
            modal.preventDefault();
            this.onSubmitCamera();
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.zoneInfo.id) {
                        this.updateZone();
                    } else {
                        this.addZone();
                    }
                    this.$refs.createOrUpdateZoneModal.hide();
                    this.$toaster.success(
                        `${
                            this.zone.id
                                ? this.$i18n.t('common.update')
                                : this.$i18n.t('common.create')
                        } ${this.$i18n.t('zone.zoneSuccess')}`
                    );
                }
            });
        },
        onSubmitCamera() {
            this.$refs.updateCameraModal.hide();
            this.$toaster.success(
                `${
                    this.zone.id ? this.$i18n.t('common.update') : this.$i18n.t('common.create')
                } ${this.$i18n.t('zone.zoneSuccess')}`
            );
        },
        async addZone() {
            delete this.zoneInfo.id;
            await this.createNewZone(this.zoneInfo);
        },
        async showUpdateZoneModal(zoneId) {
            this.resetForm();
            await this.getZoneInfo({ id: zoneId });
            this.zoneInfo = { ...this.zone };
            this.$refs.createOrUpdateZoneModal.show();
        },
        async showUpdateCameraModal(zoneId) {
            this.resetForm();
            await this.getZoneInfo({ id: zoneId });
            this.zoneInfo = { ...this.zone };
            const zoneCam = await this.getListZoneCamera({ zoneId });
            this.cameraSelected = zoneCam.map(item => item.cameraId);
            this.$refs.updateCameraModal.show();
        },
        async updateZone() {
            await this.updateZoneInfo(this.zoneInfo);
        },
        async onDeleteZone(modal) {
            modal.preventDefault();
            await this.deleteZoneById({ id: this.currentZoneId });
            if (this.searchResults.length / this.perPage === this.currentPage - 1) {
                this.currentPage--;
            }
            this.$refs.deleteZoneModal.hide();
            this.$toaster.success(this.$i18n.t('zone.deleteZoneMess'));
        },
        openCreateModal() {
            this.resetForm();
            this.$refs.createOrUpdateZoneModal.show();
        },
        async confirmDelete(zoneId) {
            this.currentZoneId = zoneId;
            this.$refs.deleteZoneModal.show();
        },
        resetForm() {
            this.zoneInfo = {};
            this.cameraSelected = [];
        },
        onWindowSizeChange(e) {
            this.updatePerPage();
        },
        updatePerPage() {
            this.perPage = Math.floor(this.$refs.reportBody.clientHeight / 57) - 2;
        },
        async onChangeCamera(cameraId) {
            if (this.cameraSelected.includes(cameraId)) {
                // add camera zone
                this.addZoneCamera({ zoneId: this.zoneInfo.id, cameraId });
            } else {
                // remove camera zone
                const list = await this.getListZoneCamera({ zoneId: this.zoneInfo.id, cameraId });
                if (list.length) {
                    this.deleteZoneCamera({ id: list[0].id });
                }
            }
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
.indexCol {
    width: 50px;
}
.region-action-col {
    width: 200px;
}
</style>

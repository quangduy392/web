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
            <template slot="sub-header-right">
                <b-button variant="outline-primary" @click="openCreateModal">
                    <i class="fa fa-plus-circle mr-2"></i>
                    <span class="text-uppercase">{{ $t('vms.createVms') }}</span>
                </b-button>
            </template>
        </sub-header>
        <div class="page-content sub-header-page-content p-4">
            <b-table
                striped
                hover
                dark
                :items="listVms"
                :current-page="currentPage"
                :per-page="CONSTANTS.ITEM_PER_PAGE"
                :fields="fields"
                show-empty
            >
                <template slot="index" slot-scope="data">
                    {{ (currentPage - 1) * CONSTANTS.ITEM_PER_PAGE + (data.index + 1) }}
                </template>
                <template slot="type" slot-scope="row">
                    <span>{{ typeName[row.value] }}</span>
                </template>
                <template slot="createdAt" slot-scope="data">
                    <span>{{ data.value | formatDateTime }}</span>
                </template>
                <template slot="actions" slot-scope="row">
                    <b-button
                        variant="primary"
                        class="mr-1 min-width-none"
                        @click="openEditModal(row.item.id)"
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
                        <span>{{ $t('vms.empty') }}</span>
                    </div>
                </template>
            </b-table>
            <div v-if="countRow > CONSTANTS.ITEM_PER_PAGE" class="my-1">
                <b-pagination
                    v-model="currentPage"
                    :total-rows="countRow"
                    :per-page="CONSTANTS.ITEM_PER_PAGE"
                    :hide-goto-end-buttons="true"
                    :prev-text="$t('common.prevPage')"
                    :next-text="$t('common.nextPage')"
                    class="my-0"
                    align="center"
                ></b-pagination>
            </div>
        </div>
        <!-- Create/Edit VMS -->
        <b-modal
            ref="createOrUpdateVmsModal"
            size="lg"
            :ok-title="`${form.id ? $t('common.update') : $t('common.create')}`"
            :title="`${form.id ? $t('vms.updateVms') : $t('vms.createVms')}`"
            :cancel-title="$t('common.cancel')"
            @ok="handleCreateVmsOk"
            no-close-on-esc
            no-close-on-backdrop
        >
            <b-form-group :label="$t('common.name')">
                <b-form-input
                    maxlength="255"
                    v-model="form.name"
                    v-validate="'required'"
                    :placeholder="$t('common.name')"
                    name="name"
                    :data-vv-as="$t('common.name')"
                ></b-form-input>
                <div v-show="errors.has('name')" class="validation-message text-danger">
                    {{ errors.first('name') }}
                </div>
            </b-form-group>
            <b-form-group label="IP:">
                <b-form-input
                    maxlength="255"
                    v-model="form.ip"
                    v-validate="'required'"
                    placeholder="IP"
                    name="ip"
                    data-vv-as="IP"
                ></b-form-input>
                <div v-show="errors.has('ip')" class="validation-message text-danger">
                    {{ errors.first('ip') }}
                </div>
            </b-form-group>
            <b-form-group :label="$t('vms.port')">
                <b-form-input
                    maxlength="255"
                    v-model="form.port"
                    type="number"
                    v-validate="'required'"
                    :placeholder="$t('vms.port')"
                    name="port"
                    :data-vv-as="$t('vms.port')"
                ></b-form-input>
                <div v-show="errors.has('port')" class="validation-message text-danger">
                    {{ errors.first('port') }}
                </div>
            </b-form-group>
            <b-form-group :label="$t('user.userName')">
                <b-form-input
                    maxlength="255"
                    v-model="form.username"
                    v-validate="'required'"
                    :placeholder="$t('user.userName')"
                    name="username"
                    :data-vv-as="$t('user.userName')"
                ></b-form-input>
                <div v-show="errors.has('username')" class="validation-message text-danger">
                    {{ errors.first('username') }}
                </div>
            </b-form-group>

            <b-form-group :label="$t('user.password')">
                <b-form-input
                    maxlength="255"
                    v-model="form.password"
                    type="password"
                    :placeholder="$t('user.password')"
                    v-validate="'required'"
                    name="pass"
                    :data-vv-as="$t('user.password')"
                ></b-form-input>
                <div v-show="errors.has('pass')" class="validation-message text-danger">
                    {{ errors.first('pass') }}
                </div>
            </b-form-group>

            <b-form-group :label="$t('vms.type')">
                <b-form-select
                    v-model="form.type"
                    v-validate="'required'"
                    name="type"
                    :data-vv-as="$t('vms.type')"
                >
                    <option :value="null">{{ $t('vms.chooseVmsType') }}</option>
                    <option v-for="vmsType in vmsTemp" :value="vmsType.value">{{
                        locale === 'vi' ? vmsType.descVN : vmsType.descEN
                    }}</option>
                </b-form-select>
                <div v-show="errors.has('type')" class="validation-message text-danger">
                    {{ errors.first('type') }}
                </div>
            </b-form-group>
        </b-modal>

        <!-- Confirm Delete User -->
        <b-modal
            ref="deleteVmsModal"
            :title="$t('common.confirmation')"
            no-close-on-esc
            no-close-on-backdrop
            :ok-title="$t('common.delete')"
            :cancel-title="$t('common.cancel')"
            ok-variant="danger"
            @ok="onDeleteVms"
            >{{ $t('vms.deleteConfirmMsg') }}</b-modal
        >
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '../../../constants';
import { i18n } from '../../../main';
import ManageSubNav from '../ManageSubNav';
export default {
    components: { ManageSubNav },
    mounted: function() {
        this.$nextTick(function() {
            this.initData();
        });
    },
    data: function() {
        return {
            form: {
                name: '',
                ip: '',
                port: null,
                username: '',
                password: '',
                type: null
            },
            currentVmsId: null,
            fields: [
                { tdClass: 'align-middle', key: 'index', label: '#' },
                { tdClass: 'align-middle', key: 'name', label: this.$i18n.t('common.name') },
                { tdClass: 'align-middle', key: 'ip', label: 'IP' },
                { tdClass: 'align-middle', key: 'port', label: this.$i18n.t('vms.port') },
                { tdClass: 'align-middle', key: 'type', label: this.$i18n.t('vms.type') },
                {
                    tdClass: 'align-middle',
                    key: 'createdAt',
                    label: this.$i18n.t('common.lastCreated')
                },
                {
                    thClass: 'fixed-actions-col',
                    key: 'actions',
                    label: this.$i18n.t('common.actions')
                }
            ],
            CONSTANTS,
            currentPage: 1
        };
    },
    computed: {
        ...mapState({
            listVms: state => state.vms.items,
            vmsInfo: state => state.vms.vmsInfo,
            vmsTemp: state => state.vms.vmsTemp
        }),
        typeName() {
            const temp = {};
            this.vmsTemp.forEach(element => {
                temp[element.value] = element.descEN;
            });
            return temp;
        },
        countRow() {
            return this.listVms.length;
        },
        locale() {
            return i18n.locale;
        }
    },
    methods: {
        ...mapActions({
            getListVms: 'vms/getList',
            getVmsInfo: 'vms/getVmsInfo',
            getVmsTemp: 'vms/getVmsTemp',
            deleteVmsById: 'vms/delete',
            updateOrCreate: 'vms/updateOrCreate'
        }),
        handleCreateVmsOk(modal) {
            modal.preventDefault();
            this.onSubmit();
        },
        openCreateModal() {
            this.resetForm();
            this.$refs.createOrUpdateVmsModal.show();
        },
        async openEditModal(vmsId) {
            this.resetForm();
            await this.getVmsInfo({ id: vmsId });
            this.form = { ...this.vmsInfo };
            this.$refs.createOrUpdateVmsModal.show();
        },
        resetForm() {
            this.form = {};
            this.form.type = null;
        },
        confirmDelete(userId) {
            this.currentVmsId = userId;
            this.$refs.deleteVmsModal.show();
        },
        async onDeleteVms(modal) {
            modal.preventDefault();
            await this.deleteVmsById({ id: this.currentVmsId });
            if (this.listVms.length / this.CONSTANTS.ITEM_PER_PAGE === this.currentPage - 1) {
                this.currentPage--;
            }
            this.$refs.deleteVmsModal.hide();
            this.$toaster.success(this.$i18n.t('vms.deleteVmsMess'));
        },
        onSubmit() {
            this.$validator.validateAll().then(result => {
                if (result) {
                    this.submitForm();
                }
            });
        },
        async submitForm() {
            this.form.port = parseInt(this.form.port);
            if (this.form.id) {
                await this.updateOrCreate(this.form);
            } else {
                this.form.type = this.form.type.toString();
                await this.updateOrCreate(this.form);
            }
            this.$refs.createOrUpdateVmsModal.hide();
            this.$toaster.success(
                `${
                    this.form.id ? this.$i18n.t('common.update') : this.$i18n.t('common.create')
                } ${this.$i18n.t('vms.vmsSuccess')}`
            );
        },
        async initData() {
            this.getListVms();
            await this.getVmsTemp();
        }
    }
};
</script>
<style lang="scss" scoped></style>

<template>
    <div class="animated fadeIn h-100">
        <sub-header hideBreadcrumb>
            <template slot="sub-header-left">
                <b-navbar-nav class="d-flex flex-row">
                    <b-nav-item to="/attendance/manage/staff" class="text-nowrap">{{
                        $t('attendanceCommon.manage.staff')
                    }}</b-nav-item>
                    <b-nav-item to="/attendance/manage/guest" class="text-nowrap">{{
                        $t('attendanceCommon.manage.guest')
                    }}</b-nav-item>
                    <b-nav-item to="/attendance/manage/stranger" class="text-nowrap">{{
                        $t('attendanceCommon.manage.stranger')
                    }}</b-nav-item>
                    <b-nav-item to="/attendance/manage/structure" class="text-nowrap">{{
                        $t('attendanceCommon.manage.structure')
                    }}</b-nav-item>
                    <b-nav-item to="/attendance/manage/region" class="text-nowrap">{{
                        $t('attendanceCommon.manage.region')
                    }}</b-nav-item>
                    <b-nav-item to="/attendance/manage/monitor" class="text-nowrap">{{
                        $t('attendanceCommon.manage.monitor')
                    }}</b-nav-item>
                </b-navbar-nav>
            </template>
            <template slot="sub-header-middle"></template>
        </sub-header>

        <div class="page-content sub-header-page-content">
            <div class="d-flex h-100">
                <div style="width: 20%" class="p-2">
                    <div class="bg-gray-900 border border-gray-500 p-2 h-100">
                        <div style="height:calc(100% - 42px); overflow:auto">
                            <TreeNode
                                v-if="nodes.length"
                                v-for="(node, index) in nodes"
                                :key="node.id"
                                :ref="'tree'"
                                :node="node"
                            />
                            <div
                                v-else
                                class="d-flex h-100 justify-content-center align-items-center"
                            >
                                {{ $t('attendanceStructure.noDepartment') }}
                            </div>
                        </div>
                        <b-button
                            variant="outline-primary"
                            v-b-modal.department-modal
                            @click="addRoot"
                            class="mt-2 w-100"
                        >
                            <i class="fa fa-plus-circle mr-2"></i>
                            {{ $t('attendanceStructure.addRoot') }}
                        </b-button>
                    </div>
                </div>
                <div style="width: 80%" class="p-2">
                    <div v-if="currentNode.id" class="h-100">
                        <div class="bg-gray-900 border border-gray-500 p-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="department-title">
                                    <span>{{ currentNode.name }}</span>
                                    <span class="mx-2">-</span>
                                    <span
                                        >{{ checkedLength }}
                                        {{ $t('attendanceStructure.staff') }}</span
                                    >
                                </div>
                                <b-button
                                    variant="outline-primary"
                                    v-b-modal.add-profile-modal
                                    @click="onAddClick"
                                >
                                    <i class="fa fa-plus-circle mr-2"></i>
                                    {{ $t('attendanceStructure.addProfile') }}
                                </b-button>
                            </div>
                        </div>
                        <div
                            class="bg-gray-900 border border-gray-500 mt-2"
                            style="height: calc(100% - 67px)"
                        >
                            <b-row class="m-0 mh-100" style="overflow:auto">
                                <b-col
                                    cols="1"
                                    class="px-1 py-1"
                                    v-if="manager.group === currentNode.path"
                                >
                                    <SimpleProfileItem
                                        :disabled="true"
                                        :profile="manager"
                                        :manager="true"
                                    />
                                </b-col>
                                <b-col
                                    cols="1"
                                    class="px-1 py-1"
                                    v-for="profile in checkedProfiles"
                                    :key="profile.id"
                                >
                                    <SimpleProfileItem :disabled="true" :profile="profile" />
                                </b-col>
                            </b-row>
                        </div>
                    </div>
                    <div v-else class="d-flex h-100 justify-content-center align-items-center">
                        {{ $t('attendanceStructure.noDepartment') }}
                    </div>
                </div>
            </div>
            <b-modal
                id="department-modal"
                :title="form.id ? $t('common.update') : $t('common.add')"
                ok-variant="primary"
                :ok-title="form.id ? $t('common.update') : $t('common.add')"
                @ok="onSubmit"
                :cancel-title="$t('common.cancel')"
            >
                <b-form-group :label="$t('attendanceStructure.name')">
                    <b-form-input
                        maxlength="255"
                        v-model="form.name"
                        v-validate="'required'"
                        name="name"
                        :placeholder="$t('attendanceStructure.name')"
                        :data-vv-as="$t('attendanceStructure.name')"
                    ></b-form-input>
                    <span class="validation-message text-danger">
                        {{ errors.first('name') }}
                    </span>
                </b-form-group>
                <b-form-group :label="$t('attendanceStructure.alias')">
                    <b-form-input
                        maxlength="255"
                        v-model="form.alias"
                        v-validate="'required'"
                        name="alias"
                        :placeholder="$t('attendanceStructure.alias')"
                        :data-vv-as="$t('attendanceStructure.alias')"
                    ></b-form-input>
                    <span class="validation-message text-danger">
                        {{ errors.first('alias') }}
                    </span>
                </b-form-group>
                <b-form-group :label="$t('attendanceStructure.manager')">
                    <VSelect
                        class="bg-white"
                        :filter="searchProfile"
                        :value="profileList.find(el => el.id === form.managerId)"
                        label="name"
                        :options="profileList"
                    />
                </b-form-group>
            </b-modal>
            <b-modal
                id="delete-department-modal"
                :title="$t('common.confirmation')"
                no-close-on-esc
                no-close-on-backdrop
                :ok-title="$t('common.delete')"
                :cancel-title="$t('common.cancel')"
                ok-variant="danger"
                @ok="onDelete"
                >{{ $t('attendanceStructure.confirmDelete') }}</b-modal
            >
            <b-modal
                size="xl"
                centered
                id="add-profile-modal"
                :title="$t('attendanceStructure.addProfile')"
                :ok-variant="'primary'"
                :ok-title="$t('common.add')"
                @ok="addProfiles"
                @hidden="pagedProfiles = []"
                :cancel-title="$t('common.cancel')"
            >
                <b-form-group>
                    <b-row>
                        <b-col
                            cols="3"
                            class="text-success d-flex align-items-center justify-content-end p-1"
                        >
                            <span>{{
                                $t('attendanceStructure.selectedCount', {
                                    count: selectedProfile.length
                                })
                            }}</span>
                        </b-col>
                        <b-col cols="6" class="p-1">
                            <b-form-input
                                maxlength="255"
                                v-model="searchInput"
                                name="name"
                                :placeholder="$t('common.search')"
                                @keyup="
                                    key => {
                                        if (key.keyCode === 13) changeSearchInput();
                                    }
                                "
                                @blur="changeSearchInput"
                            ></b-form-input>
                        </b-col>
                        <b-col cols="3" class="pl-1 d-flex align-items-center">
                            <b-form-checkbox v-model="filterAll">{{
                                $t('attendanceStructure.all')
                            }}</b-form-checkbox>
                        </b-col>
                    </b-row>
                </b-form-group>
                <div class="main-content" v-show="!isShowLoading">
                    <div v-if="pagedProfiles.length" style="height: calc(100% - 70px)">
                        <b-row class="p-0 m-0 mh-100 w-100 overflow-y-scroll">
                            <b-col
                                cols="1"
                                class="px-1 py-1"
                                v-for="profile in pagedProfiles"
                                :key="profile.id"
                            >
                                <SimpleProfileItem
                                    :profile="profile"
                                    @change="onSelectProfile"
                                    :class="[
                                        isSelectedProfile(profile)
                                            ? 'border-success opacity-60'
                                            : 'border-grey-500'
                                    ]"
                                />
                                <i
                                    @click="onSelectProfile(profile)"
                                    v-if="isSelectedProfile(profile)"
                                    class="fa fa-3x fa-check text-success cursor-pointer"
                                    aria-hidden="true"
                                    style="position:absolute; top:50%; left:50%; transform: translate(-50%, -50%); "
                                ></i>
                            </b-col>
                        </b-row>
                    </div>
                    <div
                        class="h-100 d-flex justify-content-center align-items-center"
                        v-else="!pagedProfiles.length"
                    >
                        {{ $t('attendanceStructure.noProfile') }}
                    </div>
                    <r-pagination
                        v-model="currentPage"
                        :items="filteredProfiles"
                        :per="CONSTANTS.VIDEO_LIST_PER * 2"
                        @pageChanged="updatePagedProfile"
                        v-show="filteredProfiles.length"
                    ></r-pagination>
                </div>
                <div
                    v-if="isShowLoading"
                    class="flex-1 main-content d-flex flex-column justify-content-center align-items-center"
                >
                    <img src="/static/img/loader-green.gif" class="standalone-loading" />
                </div>
            </b-modal>
        </div>
    </div>
</template>

<script>
import AttendanceSubNavbarNav from './SubNavbarNav';
import TreeNode from '@/components/TreeNode';
import SimpleProfileItem from '@/components/SimpleProfileItem';
import { mapState, mapActions } from 'vuex';
import VSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import getImageProfileUrl from '@/utils/getImageProfileUrl';
import CONSTANTS from '@/constants';

function removeAccents(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}
function countPath(node, parentPath, pathList) {
    node.path = parentPath ? parentPath + '/' + node.alias : node.alias;
    pathList.push(node.path);
    for (const key in node.children) {
        countPath(node.children[key], node.path, pathList);
    }
}
export default {
    components: {
        AttendanceSubNavbarNav,
        TreeNode,
        VSelect,
        SimpleProfileItem
    },
    mounted() {
        this.$nextTick(function() {
            this.initData();
            this.getProfileList();
            this.getImageProfile();
        });
    },
    data() {
        return {
            nodes: [],
            form: {},
            selectedProfile: [],
            searchInput: '',
            realSearchInput: '',
            allSelected: false,
            indeterminate: false,
            filterOptions: [
                { value: true, text: this.$t('attendanceStructure.all') },
                { value: false, text: this.$t('attendanceStructure.noDepartmentProfiles') }
            ],
            filterAll: true,
            addModal: true,
            currentPage: 1,
            CONSTANTS,
            pagedProfiles: [],
            pathList: [],
            isShowLoading: false
        };
    },
    watch: {
        currentForm() {
            this.form = { ...this.currentForm };
        }
    },
    computed: {
        ...mapState({
            currentNode: state => state.structure.currentNode,
            currentForm: state => state.structure.form,
            nodeList: state => state.structure.nodeList,
            profileList: state => state.profile.items,
            listAllImages: state => state.profile.listAllImages
        }),
        manager() {
            const profile = this.profileList.find(el => el.id === this.currentNode.managerId);
            if (profile) return profile;
        },
        managerAvatar() {
            const tmp = this.listAllImages.find(
                el => el.profileId === this.manager.id && el.portrait === true
            );
            return tmp
                ? this.getImageProfileUrl(this.manager.id, tmp.id)
                : '/static/img/avatar-default.jpg';
        },
        checkedProfiles() {
            return this.profileList.filter(
                el => el.group === this.currentNode.path && el.id !== this.manager.id
            );
        },
        unCheckedProfiles() {
            return this.profileList.filter(
                el => el.type === 'staff' && el.group !== this.currentNode.path
            );
        },
        freeProfiles() {
            return this.profileList.filter(
                element => element.type === 'staff' && this.pathList.indexOf(element.group) === -1
            );
        },
        filteredProfiles() {
            const latinSearch = new RegExp(removeAccents(this.realSearchInput), 'i');
            const baseList = !this.filterAll ? this.freeProfiles : this.unCheckedProfiles;
            return baseList.filter(profile => {
                const label = removeAccents(profile.name);
                return latinSearch.test(label);
            });
        },
        checkedLength() {
            return (
                this.checkedProfiles.length + (this.manager.group === this.currentNode.path ? 1 : 0)
            );
        }
    },
    methods: {
        ...mapActions({
            getStructure: 'structure/getStructure',
            getProfileList: 'profile/getList',
            addNode: 'structure/addNode',
            editNode: 'structure/editNode',
            deleteNode: 'structure/deleteNode',
            editProfiles: 'structure/editProfiles',
            getImageProfile: 'profile/getImageProfile'
        }),
        async initData() {
            await this.getStructure();
            this.mapTreeStructure();
        },
        mapTreeStructure() {
            const source = this._.cloneDeep(this.nodeList);
            source.forEach(element => {
                if (!element.children) {
                    element.children = [];
                }
                if (element.parentId) {
                    const parent = source.find(item => item.id === element.parentId);
                    parent.children.push(element);
                }
            });
            this.nodes = [...source.filter(element => element.parentId == null)];
            for (const key in this.nodes) {
                countPath(this.nodes[key], null, this.pathList);
            }
        },
        managerChange(value) {
            if (value) this.form.managerId = value.id;
        },
        searchProfile(options, search) {
            const latinSearch = new RegExp(removeAccents(search), 'i');
            return options.filter(option => {
                const label = removeAccents(option.name);
                return latinSearch.test(label);
            });
        },
        addRoot() {
            this.form = {};
        },
        onSubmit(bvModalEvt) {
            bvModalEvt.preventDefault();
            this.$validator.validateAll().then(result => {
                if (result) {
                    if (this.form.id) {
                        this.editNode(this.form).then(() => {
                            this.initData();
                            this.$bvModal.hide('department-modal');
                            this.$toaster.success(
                                this.$i18n.t('attendanceStructure.updateSuccess')
                            );
                        });
                    } else {
                        this.addNode(this.form).then(() => {
                            this.initData();
                            this.$bvModal.hide('department-modal');
                            this.$toaster.success(this.$i18n.t('attendanceStructure.addSuccess'));
                        });
                    }
                }
            });
        },
        onDelete() {
            this.deleteNode(this.form).then(() => {
                this.initData();
                this.$bvModal.hide('delete-department-modal');
                this.$toaster.success(this.$i18n.t('attendanceStructure.deleteSuccess'));
            });
        },
        addProfiles(bvModalEvt) {
            bvModalEvt.preventDefault();
            if (this.selectedProfile.length) {
                const tmp = this._.cloneDeep(this.selectedProfile);
                this.editProfiles(
                    tmp.map(element => {
                        element.group = this.currentNode.path;
                        return element;
                    })
                ).then(() => {
                    this.getProfileList();
                    setTimeout(() => {
                        this.$bvModal.hide('add-profile-modal');
                        this.$toaster.success(
                            this.$i18n.t('attendanceStructure.addProfileSuccess')
                        );
                    }, 0);
                });
            } else {
                this.$toaster.error(this.$i18n.t('attendanceStructure.noSelectedProfile'));
            }
        },
        isSelectedProfile(profile) {
            return this.selectedProfile.find(el => el.id === profile.id);
        },
        onSelectProfile(profile) {
            if (!this.isSelectedProfile(profile)) {
                this.selectedProfile.push(profile);
            } else {
                this.selectedProfile.splice(
                    this.selectedProfile.findIndex(element => element.id === profile.id),
                    1
                );
            }
        },
        onAddClick() {
            this.selectedProfile = [];
            this.searchInput = '';
            this.realSearchInput = '';
            this.filterAll = false;
            this.currentPage = 1;
        },
        getImageProfileUrl,
        updatePagedProfile(pagedProfiles) {
            this.isShowLoading = true;
            setTimeout(() => {
                this.pagedProfiles = pagedProfiles;
                this.isShowLoading = false;
            }, 200);
        },
        changeSearchInput() {
            this.currentPage = 1;
            this.realSearchInput = this.searchInput;
        }
    }
};
</script>

<style scoped>
.selected-profile {
    font-weight: bold;
}
.main-content {
    height: calc(100vh - 350px);
    overflow: auto;
}
.event-text-color {
    color: lime;
    background-color: rgba(0, 0, 0, 0.6);
}
.opacity-60 {
    opacity: 0.6;
}
.department-title {
    font-size: 1.75rem;
}
</style>

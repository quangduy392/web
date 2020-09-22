<template>
    <div
        class="border-left border-gray-500 h-100 d-flex flex-column justify-content-between text-gray-300"
    >
        <div class="objects-filter-sidebar_filter-container h-100 overflow-y-auto">
            <!-- Color filter -->
            <b-dropdown
                dropleft
                no-caret
                class="w-100 object-filter-item"
                toggle-class="bg-transparent text-gray-300 border-none border-bottom border-gray-500 text-left p-3 shadow-none"
                menu-class="bg-gray-900 border border-right-0 border-gray-500 has-treeselect"
            >
                <template slot="button-content">
                    <div
                        :class="{
                            'text-white font-weight-bold': isTreeSelectActive(filter.groups)
                        }"
                    >{{ $t('user.group') }}</div>
                    <div
                        class="text-muted font-weight-normal small d-flex"
                        v-line-clamp="1"
                        v-if="isTreeSelectActive(filter.groups)"
                    >{{ getClassTreeSelectedText() }}</div>
                </template>
                <b-dropdown-form class="p-0">
                    <treeselect
                        v-model="filter.groups"
                        :multiple="true"
                        :options="getGroupTreeOptions()"
                        always-open
                        :default-expand-level="1"
                        @input="updateFilter"
                    ></treeselect>
                </b-dropdown-form>
            </b-dropdown>
        </div>

        <div class="d-flex border-top border-gray-500">
            <div
                class="flex-1 text-center p-2 filter-preset-btn"
                :class="{ active: isFiltering() }"
                @click="resetFilter"
            >
                <i class="fa fa-undo" aria-hidden="true"></i>
                <br />
                <span class="font-10">{{ $t('objectFilterSidebar.resetFilter') }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';

export default {
    name: 'profile-filter-sidebar',
    components: { Treeselect },
    props: {
        plateProfileList: {
            type: Array,
            default: []
        },
        profileList: {
            type: Array,
            default: []
        },
        filterGroups: {
            type: Array,
            default: []
        }
    },
    data() {
        return {
            filter: {
                groups: ['all']
            }
        };
    },
    watch: {
        plateProfileList(val) {
            this.updateFilter();
        }
    },
    methods: {
        // Group filter
        getGroupTreeOptions() {
            return [
                {
                    id: 'all',
                    label: this.$t('objectFilterSidebar.all'),
                    children: _.sortBy(this.filterGroups).map(item => ({
                        id: item,
                        label: item
                    }))
                }
            ];
        },
        getClassTreeSelectedText() {
            if (this.filter.groups.length === 0) {
                return this.$t('profile.none');
            } else {
                const selectedGroupText = this.filter.groups.map(item => item);
                return selectedGroupText.join(', ');
            }
        },

        // Update filter
        updateFilter() {
            const filteredItems = this.plateProfileList.filter(item => {
                const profile = _.find(this.profileList, { id: item.profileId });
                const profileName = profile ? profile.name : '';
                let isFiltered = true;
                if (this.isTreeSelectActive(this.filter.groups)) {
                    isFiltered = isFiltered && this.filter.groups.indexOf(profileName) > -1;
                }
                return isFiltered;
            });
            this.$emit('doFilter', filteredItems);
        },
        isTreeSelectActive(filterValue) {
            return filterValue.length === 0 || filterValue.indexOf('all') === -1;
        },
        isFiltering() {
            return this.isTreeSelectActive(this.filter.groups);
        },
        resetFilter() {
            if (this.isFiltering()) {
                this.filter = {
                    groups: ['all']
                };
            }
        }
    }
};
</script>

<style lang="scss" scoped>
</style>

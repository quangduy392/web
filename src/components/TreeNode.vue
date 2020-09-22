<template>
    <div>
        <div
            style="min-width: 100%;width:fit-content"
            :class="['d-flex tree-node justify-content-between align-items-center p-1 cursor-pointer', isSelected?'selected-node':'']"
            @mouseover="isHoving = true"
            @mouseleave="isHoving = false"
            @click="selectNode"
        >
            <div v-if="!editting" class="tree-node-label">
                <i class="fa fa-folder"></i>
                {{nodeData.name}} - {{nodeData.alias}}
            </div>

            <div v-show="isHoving" class="node-action ml-3">
                <b-button
                    class="ml-1 min-width-none"
                    variant="primary"
                    size="sm"
                    v-b-modal.department-modal
                    v-b-tooltip.hover
                    :title="$t('attendanceStructure.addChild')"
                    @click="addChild"
                >
                    <i class="fa fa-plus-circle"></i>
                </b-button>
                <b-button
                    class="ml-1 min-width-none"
                    variant="secondary"
                    size="sm"
                    v-b-modal.department-modal
                    v-b-tooltip.hover
                    :title="$t('common.edit')"
                    @click="edit"
                >
                    <i class="fa fa-pencil"></i>
                </b-button>
                <b-button
                    class="ml-1 min-width-none"
                    variant="danger"
                    size="sm"
                    v-b-tooltip.hover
                    :title="$t('common.delete')"
                    @click="deleteNode"
                >
                    <i class="fa fa-trash"></i>
                </b-button>
            </div>
        </div>
        <TreeNode
            class="ml-4"
            v-for="(child, index) in nodeData.children"
            :key="child.id"
            :node="child"
        ></TreeNode>
    </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

export default {
    name: 'TreeNode',
    components: {},
    props: {
        node: Object
    },
    watch: {
        node() {
            this.nodeData = this._.cloneDeep(this.node);
            this.count = this.nodeData.children.length;
        }
    },
    mounted: function() {
        this.$nextTick(function() {
            this.nodeData = this._.cloneDeep(this.node);
            this.count = this.nodeData.children.length;
        });
    },
    data: function() {
        return {
            editting: false,
            nodeData: {},
            isHoving: false,
            count: 0
        };
    },
    computed: {
        ...mapState({
            currentNode: state => state.structure.currentNode
        }),
        isSelected() {
            return this.nodeData.id === this.currentNode.id;
        }
    },
    methods: {
        ...mapActions({}),
        ...mapMutations({
            setCurrentNode: 'structure/SET_CURRENT_NODE',
            setForm: 'structure/SET_FORM'
        }),
        selectNode() {
            this.setCurrentNode(this.nodeData);
        },
        addChild() {
            this.setForm({ parentId: this.nodeData.id });
        },

        edit() {
            this.setForm(this.nodeData);
        },
        deleteNode() {
            if (this.nodeData.children.length === 0) {
                this.setForm(this.nodeData);
                this.$bvModal.show('delete-department-modal');
            } else {
                this.$toaster.error(this.$i18n.t('attendanceStructure.nodeHasChildrens'));
            }
        }
    }
};
</script>
<style scoped>
.tree-node {
    align-items: center;
    min-height: 36px;
}
.tree-node:hover {
    background-color: #3e515b;
}
.node-action {
    min-width: 110px;
}
.selected-node {
    background-color: #96a4ac;
}
.selected-node:hover {
    background-color: #96a4ac;
}
.tree-node-label {
    white-space: nowrap;
}
</style>
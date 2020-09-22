<template>
    <div>
        <case-object
            :object="item.content"
            class="h-100"
            v-if="item.type === CONSTANTS.BOOKMARK_TYPES.OBJECT"
        ></case-object>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import CONSTANTS from '@/constants';
import CaseObject from '@/components/CaseObject';

export default {
    name: 'bookmark-item',
    components: {
        CaseObject
    },
    props: {
        item: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            CONSTANTS,
            isHovering: false
        };
    },
    computed: {
        ...mapState({})
    },
    methods: {
        ...mapActions({})
    }
};
</script>

<style lang="scss" scoped>
</style>

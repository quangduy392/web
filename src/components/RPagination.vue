<template>
    <div class="text-center">
        <b-pagination
            v-model="currentPage"
            :total-rows="items.length"
            :per-page="per"
            class="justify-content-center mt-3"
            @input="pageChanged"
            v-if="items.length > per && !loadMore"
        ></b-pagination>

        <b-button
            variant="outline-primary"
            @click="pageChanged(currentPage + 1)"
            class="my-3"
            v-if="isShowLoadMore()"
        >
            <span>{{ $t('alert.loadMore') }}</span>
            <i class="ml-2 fa fa-chevron-down"></i>
        </b-button>
    </div>
</template>

<script>
import CONSTANTS from '@/constants';

export default {
    name: 'r-pageination',
    props: {
        items: {
            type: Array,
            default: []
        },
        per: {
            type: Number,
            default: CONSTANTS.ITEM_PER_PAGE
        },
        // v-model - current page number
        value: {
            type: Number,
            default: 1
        },
        loadMore: {
            type: Boolean,
            default: false
        }
    },
    mounted() {
        this.$nextTick(function() {
            this.currentPage = this.value;
            this.pageChanged(this.value);
        });
    },
    data() {
        return {
            currentPage: 1
        };
    },
    watch: {
        value(val) {
            this.currentPage = val;
        },
        items(val) {
            this.pageChanged(this.currentPage);
        }
    },
    methods: {
        pageChanged(pageNo) {
            const start = (pageNo - 1) * this.per;
            const end = start + this.per;
            const pagedItems = this.items.slice(start, end);

            this.$emit('input', pageNo); // Update page v-model
            this.$emit('pageChanged', pagedItems);
        },
        isShowLoadMore() {
            const maxPage = Math.ceil(this.items.length / this.per);
            return this.loadMore && this.currentPage < maxPage;
        }
    }
};
</script>

<style lang="scss" scoped>
</style>

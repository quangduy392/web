<template>
    <div>
        <b-form-group label="Icon">
            <b-input placeholder="Icon"></b-input>
        </b-form-group>
        <b-form-group label="Màu icon">
            <b-input placeholder="Màu icon"></b-input>
        </b-form-group>
        <b-form-group label="Danh sách thuộc tính">
            <vue-tags-input v-model="tag" :tags="tags" placeholder="Nhập thuộc tính" :autocomplete-items="tagsSuggest"/>
        </b-form-group>
        <b-form-group label="Phép toán">
            <b-form-select :options="options"></b-form-select>
        </b-form-group>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import VueTagsInput from '@johmun/vue-tags-input';

export default {
    name: 'chart-element',
    components: { VueTagsInput },
    mounted: function() {
        this.$nextTick(async function() {});
    },
    props: {},
    data() {
        return {
            tag: '',
            tags: [],
            tagsSuggest: ['person', 'car', 'bicycle', 'trunk', 'bus'],
            options: ['max', 'count', 'average']
        };
    },
    computed: {
        ...mapState({})
    },
    watch: {},
    methods: {
        ...mapActions({})
    }
};
</script>
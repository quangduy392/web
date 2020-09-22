<template>
    <b-row>
        <b-col cols="12">
            <h5 v-line-clamp="1" class="card-title mb-0">{{ input.title }}</h5>
        </b-col>
        <b-col v-for="(item, key) in listItem" :key="key">
            <b-row>
                <b-col class="text-center">
                    <div class="font-weight-normal" v-line-clamp="1">{{ item.name }}</div>
                    <div style="font-size: 32px; font-weight: 400;">
                        <i :class="item.icon" class="mr-2" :style="{ color: item.iconColor }" />{{
                            item.content
                        }}
                    </div>
                </b-col>
            </b-row>
        </b-col>
    </b-row>
</template>
<script>
import _ from 'lodash';
import getObjectTime from '@/utils/getObjectTime';
export default {
    props: {
        input: {}
    },
    name: 'report-info',
    components: {},
    data() {
        return {
            listItem: []
        };
    },
    watch: {
        input(newValue) {
            this.loadData();
        }
    },
    methods: {
        async loadData() {
            this.listItem = [];
            for (const item of this.input.items) {
                const resource = _.filter(this.input.videoObjects, obj =>
                    item.field.includes(obj.class)
                );
                let content = 0;
                if (item.operator === 'count') {
                    content = resource.length;
                } else if (item.operator === 'max') {
                    const listTime = resource.map(
                        it => (it.time = getObjectTime(it)._d.getHours())
                    );
                    const countTimePerHour = _.countBy(listTime);
                    content = _.max(Object.values(countTimePerHour));
                } else if (item.operator === 'average') {
                    const listTime = resource.map(
                        it => (it.time = getObjectTime(it)._d.getHours())
                    );
                    const countTimePerHour = _.countBy(listTime);
                    content = _.mean(Object.values(countTimePerHour));
                    content = Math.round(content);
                }
                this.listItem.push({
                    name: item.name,
                    icon: item.icon,
                    iconColor: item.iconColor,
                    content: content
                });
            }
        }
    },
    mounted() {
        this.loadData();
    }
};
</script>

<style scoped>
.card-body {
    padding: 10px;
}
</style>


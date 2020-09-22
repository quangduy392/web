<template>
    <b-row v-if="events.length" class="px-4">
        <b-col class="p-1" cols="1" v-for="event in events" :key="event.id">
            <NewestFaceItem :event="event" />
        </b-col>
    </b-row>
</template>

<script>
import NewestFaceItem from '@/components/NewestFaceItem';

export default {
    name: 'attendance-newest-face-list',
    props: ['events'],
    components: { NewestFaceItem },
    mounted: function() {
        this.$nextTick(async function() {});
    },
    data() {
        return {};
    },
    methods: {}
};
</script>

<style lang="scss" scoped>
</style>

<template>
    <div class="d-flex flex-wrap month-table-container">
        <div
            :class="['day-item', isSelected(date)? 'day-item-selected':'']"
            v-for="date in 31"
            :key="date"
            @click="toggleSelect(date)"
        >
            <span>{{date}}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {};
    },
    methods: {
        isSelected(date) {
            return this.value.indexOf(date) > -1;
        },
        toggleSelect(date) {
            const tmp = [...this.value];
            const index = tmp.indexOf(date);
            if (index > -1) {
                tmp.splice(index, 1);
            } else {
                tmp.push(date);
            }
            this.$emit('input', this._.sortBy(tmp));
        }
    }
};
</script>

<style>
.month-table-container {
    width: 594px;
    background: #424242;
    border: 1px solid;
    border-radius: 10px;
    padding: 2px;
}
.day-item {
    width: 80px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 10px;
    margin: 2px;
}
.day-item:hover {
    background-color: #6bd3f8;
}
.day-item.day-item-selected {
    background-color: #20a8d8;
}
</style>
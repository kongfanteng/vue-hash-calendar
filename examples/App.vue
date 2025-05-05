<template>
  <div class="body">
    <MrCalendarCenter :isShowArrow="true"
                      class="vue-hash-calendar"
                      :changeYearFast="true"
                      :isShowWeekView="false"
                      pickerType="date"
                      ref="picker"
                      :is-show-arrow="false"
                      :is-show-not-current-month-day="true"
                      :scroll-change-date="true"
                      :visible.sync="isShowCalendar"
                      :default-datetime="defaultDatetime"
                      :is-show-week-view="false"
                      :is-show-action="true"
                      :is-auto-change-month="true"
                      :minute-step="1"
                      :disabled-scroll="false"
                      :mark-date="markDate"
                      mark-type="dotcircle"
                      week-start="sunday"
                      picker-type="datetime"
                      :show-today-button="true"
                      :disabled-week-view="false"
                      :change-year-fast="true"
                      :theme-color="themeColor"
                      format="YY/MM/DD hh:mm"
                      lang="en"
                      calendarType="card"
                      @calendarTypeChange="calendarTypeChange"
                      @confirm="dateConfirm"
                      @slidechange="slidechange"
                      @click="dateClick"
                      @change="dateChange"
                      @setting="dateSetting">
    </MrCalendarCenter>
  </div>
</template>

<script>
const currentYear = new Date().getFullYear();

export default {
    name: 'demo',
    components: {},
    data() {
        return {
            themeColor: {}, // Theme color
            isShowCalendar: true, // Whether to show the popup
            isShowTips: false, // Whether to show the download prompt
            defaultDatetime: new Date(),
            markDate: [
                `${currentYear}/05/24`,
                `${currentYear}/05/22`,
                {
                    color: 'red',
                    type: 'dot',
                    date: [
                        '0',
                        `${currentYear}/02/25`,
                        `${currentYear}/03/25`,
                        `${currentYear}/04/01`,
                        `${currentYear}/05/25`,
                        `${currentYear}/06/25`,
                        `${currentYear}/07/25`,
                        `${currentYear}/08/25`,
                        `${currentYear}/09/25`,
                        `${currentYear}/10/25`,
                        `${currentYear}/11/25`,
                        `${currentYear}/12/25`
                    ]
                },
                {
                    color: 'blue',
                    type: 'circle',
                    date: [
                        `${currentYear}/01/20`,
                        `${currentYear}/02/20`,
                        `${currentYear}/03/20`,
                        `${currentYear}/04/20`,
                        `${currentYear}/05/20`,
                        `${currentYear}/06/20`,
                        `${currentYear}/07/20`,
                        `${currentYear}/08/20`,
                        `${currentYear}/09/20`,
                        `${currentYear}/10/20`,
                        `${currentYear}/11/20`,
                        `${currentYear}/12/20`
                    ]
                },
                {
                    color: 'pink',
                    date: [
                        `${currentYear}/01/12`,
                        `${currentYear}/02/12`,
                        `${currentYear}/03/12`,
                        `${currentYear}/04/12`,
                        `${currentYear}/05/12`,
                        `${currentYear}/06/12`,
                        `${currentYear}/07/12`,
                        `${currentYear}/08/12`,
                        `${currentYear}/09/12`,
                        `${currentYear}/10/12`,
                        `${currentYear}/11/12`,
                        `${currentYear}/12/12`
                    ]
                },
                {
                    color: '#000000',
                    date: [
                        `${currentYear}/01/29`,
                        `${currentYear}/02/29`,
                        `${currentYear}/03/29`,
                        `${currentYear}/04/29`,
                        `${currentYear}/05/29`,
                        `${currentYear}/06/29`,
                        `${currentYear}/07/29`,
                        `${currentYear}/08/29`,
                        `${currentYear}/09/29`,
                        `${currentYear}/10/29`,
                        `${currentYear}/11/29`,
                        `${currentYear}/12/29`
                    ]
                }
            ] // Marked dates in object array format, allowing custom mark colors
        };
    },
    mounted() {
        // this.defaultDatetime = new Date('2019-06-01 19:04');
    },
    methods: {
        showCalendarDialog() {
            // Show the calendar
            this.isShowCalendar = true;
        },
        dateChange(date) {
            // Triggered when the date changes
            console.log(date, 'change');
        },
        dateConfirm(date) {
            // Triggered when the confirm button is clicked
            console.log(date, 'confirm');
        },
        slidechange(direction) {
            // Slide direction
            console.log(direction, 'direction');
        },
        dateClick(date) {
            // Triggered when a date is clicked
            console.log(date, 'click');
        },
        calendarTypeChange(type) {
            // Triggered when the calendar display type changes
            console.log(type, 'calendarType');
        },
        disabledDate(date) {
            // Disabled dates
            let timestamp = date.getTime();
            let oneDay = 24 * 60 * 60 * 1000;

            if (timestamp < new Date().getTime() - oneDay) {
                return true;
            }
            return false;
        },
        disabledTime(date) {
            // Disabled times
            let hours = date.getHours();
            let minute = date.getMinutes();
            let hoursNow = new Date().getHours();
            let minuteNow = new Date().getMinutes();

            if (hours < hoursNow || (hours === hoursNow && minute < minuteNow)) {
                return true;
            }
            return false;
        },
        lastMonth() {
            this.$refs.picker.lastMonth();
        },
        nextMonth() {
            this.$refs.picker.nextMonth();
        },
        lastWeek() {
            this.$refs.picker.lastWeek();
        },
        nextWeek() {
            this.$refs.picker.nextWeek();
        },
        dateSetting() {
            console.log('dateSetting:');
        }
    }
};
</script>
<style lang="scss" scoped>
@use '../packages/MrCalendar/style/common.scss';
.vue-hash-calendar {
    width: common.px2vw(450px) !important;
}
</style>
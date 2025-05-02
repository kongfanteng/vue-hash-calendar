<template>
  <div class="hash-calendar calendar_inline"
       v-show="isShowDatetimePicker"
       :style="{
      height: `${calendarContentHeight + calArrowHeight()}px`,
    }"
       @click="close">
    <div class="calendar_content"
         :style="{
        height: `${calendarContentHeight}px`,
        bottom: `${calArrowHeight()}px`,
      }"
         @click.stop>
      <div class="calendar_title"
           v-if="isShowAction"
           ref="calendarTitle">
        <slot name="action">
          <div class="calendar_title_date">
            <span class="calendar_title_date_year"
                  :class="{ calendar_title_date_active: isShowCalendar }"
                  @click="showCalendar">{{
                formatDate(
                  `${checkedDate.year}/${checkedDate.month + 1}/${
                    checkedDate.day
                  }`,
                  language.DEFAULT_DATE_FORMAT
                )
              }}</span>
          </div>
          <div v-if="showTodayButton"
               :class="{ today_disable: disabledDate(new Date()) }"
               @click="today">
            <slot name="today">
              {{ language.TODAY }}
            </slot>
          </div>
        </slot>
      </div>
      <MrCalendar ref="calendar"
                  :show="isShowCalendar"
                  :isShowWeekView.sync="isShowWeek"
                  v-bind="{ ...$props, ...$attrs }"
                  :calendarTitleHeight="calendarTitleHeight"
                  :default-date="currDateTime"
                  @height="heightChange"
                  @touchstart="touchStart"
                  @touchmove="touchMove"
                  @touchend="touchEnd"
                  @slidechange="slideChange"
                  @change="dateChange"
                  @click="dateClick">
        <template v-if="hasSlot('week')"
                  slot="week"
                  slot-scope="scope">
          <slot name="week"
                :week="scope.week"> </slot>
        </template>
        <template v-if="hasSlot('day')"
                  slot="day"
                  slot-scope="scope">
          <slot name="day"
                :date="scope.date"
                :extendAttr="scope.extendAttr">
          </slot>
        </template>
      </MrCalendar>
    </div>
    <div class="ctrl-img"
         ref="arrow"
         v-if="isShowArrowImg"
         @click.stop="toggleWeek"
         :style="{ 'margin-top': `${calendarContentHeight}px` }">
      <slot name="arrow"
            :show="isShowWeek">
        <img class="ctrl-img-handler"
             :src="isShowWeek ? arrowDownImg : arrowUpImg" />
      </slot>
    </div>
  </div>
</template>

<script>
// @ts-checkx
import MrCalendar from './MrCalendar.vue';
import { formatDate } from '../utils/util';
import { ARROW_DOWN_IMG, ARROW_UP_IMG } from '../constant/img';
import languageUtil from '../language';

const defaultDate = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  day: new Date().getDate(),
  hours: new Date().getHours(),
  minutes: new Date().getMinutes(),
};
/**
<MrCalendarCenter>
  <template v-slot:action>
    <div>Custom Content</div>
  </template>
  <template v-slot:today>
    Return to Today
  </template>
</MrCalendarCenter>
 */
export default {
  props: {
    // Theme color
    themeColor: {
      type: Object,
      default: () => {},
    },
    // Whether to support fast year switching by clicking the date area
    changeYearFast: {
      type: Boolean,
      default: false,
    },
    // Whether to show the arrow for switching between week and month views
    isShowArrow: {
      type: Boolean,
      default: false,
    },
    // Whether to show the week view
    isShowWeekView: {
      type: Boolean,
      default: false,
    },
    // Whether to show the calendar component
    visible: {
      type: Boolean,
      default: false,
    },
    // Whether to show the calendar component's action bar
    isShowAction: {
      type: Boolean,
      default: true,
    },
    pickerType: {
      type: String,
      default: 'date',
    },
    showTodayButton: {
      // Whether to show the "Return to Today" button
      type: Boolean,
      default: true,
    },
    defaultDatetime: {
      // Default time
      type: Date,
      default() {
        return new Date();
      },
    },
    format: null, // Date format returned after confirmation
    // Marked dates
    markDate: {
      type: Array,
      default: () => [],
    },
    // Disabled dates
    disabledDate: {
      type: Function,
      default: () => {
        return false;
      },
    },
    // Language pack to use
    lang: {
      type: String,
      default: 'EN',
    },
  },
  components: {
    MrCalendar,
  },
  name: 'MrCalendarCenter',
  data() {
    return {
      arrowDownImg: ARROW_DOWN_IMG,
      arrowUpImg: ARROW_UP_IMG,
      language: {}, // Language pack to use
      checkedDate: defaultDate, // Selected date
      isShowWeek: false,
      isShowCalendar: false, // Whether to show the calendar picker
      calendarBodyHeight: 0, // Height of the calendar content
      calendarTitleHeight: 0, // Height of the calendar title
      currDateTime: new Date(), // Current date
      yearMonthType: 'date', // Default type for year/month selection panel
    };
  },
  mounted() {
    this.isShowDatetimePicker = true;
    this.language = languageUtil[this.lang.toUpperCase()];
  },
  watch: {
    themeColor: {
      handler(val) {
        val && this.changeThemeColor();
      },
      immediate: true,
    },
    defaultDatetime: {
      handler(val) {
        if (!(val instanceof Date)) {
          throw new Error(
            "The calendar component's defaultDate must be date type!"
          );
        }

        this.currDateTime = val;
      },
      immediate: true,
    },
    isShowAction(flag) {
      if (!flag) {
        this.calendarTitleHeight = 0;
      } else {
        setTimeout(() => {
          this.calendarTitleHeight = this.$refs.calendarTitle
            ? this.$refs.calendarTitle.offsetHeight
            : 0;
        });
      }
    },
    checkedDate: {
      handler() {
        let date = new Date(
          `${this.checkedDate.year}/${this.checkedDate.month + 1}/${
            this.checkedDate.day
          } ${this.checkedDate.hours}:${this.checkedDate.minutes}`
        );
        if (this.format) {
          date = formatDate(date, this.format, this.lang);
        }
        this.$emit('change', date);
      },
      deep: true,
    },
    visible: {
      handler(val) {
        this.isShowCalendar = val;

        setTimeout(() => {
          this.calendarTitleHeight = this.$refs.calendarTitle
            ? this.$refs.calendarTitle.offsetHeight
            : 0;
        });
      },
      immediate: true,
    },
    isShowWeekView: {
      handler(val) {
        this.isShowWeek = val;
      },
      immediate: true,
    },
    yearMonthType(val) {
      this.$emit('calendarTypeChange', val);
    },
    isShowWeek(val) {
      if (val) {
        this.yearMonthType = 'week';
      } else {
        this.yearMonthType = 'date';
      }
    },
  },
  computed: {
    isShowArrowImg() {
      return this.isShowArrow;
    },
    // Whether to show the date picker
    isShowDatetimePicker: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      },
    },
    // Height of the calendar component
    calendarContentHeight() {
      return this.calendarBodyHeight + this.calendarTitleHeight;
    },
  },
  methods: {
    // Check if a slot exists
    hasSlot(slotName) {
      return !!this.$scopedSlots[slotName];
    },
    // Toggle week view
    toggleWeek() {
      this.isShowWeek = !this.isShowWeek;

      if (this.isShowWeek) this.slideChange('up');
      else this.slideChange('down');
    },
    today() {
      if (this.disabledDate(new Date())) return;

      this.$refs.calendar.today();
    },
    lastMonth() {
      this.$refs.calendar.getLastMonth();
    },
    nextMonth() {
      this.$refs.calendar.getNextMonth();
    },
    lastWeek() {
      this.$refs.calendar.getLastMonth();
      this.$refs.calendar.changeWeekView({ isNext: false });
    },
    nextWeek() {
      this.$refs.calendar.getNextMonth();
      this.$refs.calendar.changeWeekView({ isNext: true });
    },
    dateChange(date) {
      date.hours = this.checkedDate.hours;
      date.minutes = this.checkedDate.minutes;
      this.checkedDate = date;
    },
    dateClick(date) {
      date.hours = this.checkedDate.hours;
      date.minutes = this.checkedDate.minutes;
      this.checkedDate = date;

      let fDate = new Date(
        `${this.checkedDate.year}/${this.checkedDate.month + 1}/${
          this.checkedDate.day
        } ${this.checkedDate.hours}:${this.checkedDate.minutes}`
      );
      if (this.format) {
        fDate = formatDate(fDate, this.format, this.lang);
      }

      // Control the next selection panel after clicking
      if (date.type) {
        switch (date.type) {
          case 'yearRange':
            this.yearMonthType = 'year';
            break;
          case 'year':
            this.yearMonthType = 'month';
            break;
          case 'month':
            this.currDateTime = new Date(fDate);
            this.yearMonthType = 'date';
            break;
        }
      }

      this.$emit('click', fDate);
    },
    timeChange(date) {
      date.year = this.checkedDate.year;
      date.month = this.checkedDate.month;
      date.day = this.checkedDate.day;
      this.checkedDate = date;
    },

    show() {
      this.isShowDatetimePicker = true;
    },
    close() {
      this.isShowDatetimePicker = false;
    },
    // Add a leading zero for numbers less than 10
    fillNumber(val) {
      return val > 9 ? val : '0' + val;
    },
    formatDate(time, format) {
      return formatDate(time, format, this.lang);
    },
    // Show the calendar picker
    showCalendar() {
      if (this.isShowCalendar) {
        this.showYearMonthPicker();
      } else {
        this.yearMonthType = 'date';
      }
      this.isShowCalendar = true;
    },
    // Show the year/month selection panel
    showYearMonthPicker() {
      if (!this.changeYearFast || this.isShowWeek) return;

      if (this.yearMonthType === 'date') {
        this.yearMonthType = 'month';
      } else if (this.yearMonthType === 'month') {
        this.yearMonthType = 'year';
      } else if (this.yearMonthType === 'year') {
        this.yearMonthType = 'yearRange';
      } else {
        this.yearMonthType = 'date';
      }
    },
    // Height change
    heightChange(height) {
      this.calendarBodyHeight = height;
    },
    // Calculate height based on the arrow slot
    calArrowHeight() {
      const height =
        (this.isShowArrowImg &&
          this.$refs.arrow &&
          this.$refs.arrow.offsetHeight) ||
        0;
      return height;
    },
    // Change theme color
    changeThemeColor() {
      const themeColorKeys = Object.keys(this.themeColor || {});

      if (themeColorKeys.length) {
        let cssText = '';

        themeColorKeys.forEach((k) => {
          cssText += `--hash-calendar-${k}: ${this.themeColor[k]};`;
        });

        this.$nextTick(() => {
          document.querySelector('.hash-calendar').style.cssText = cssText;
        });
      }
    },
    // Listen to touch start event
    touchStart(event) {
      this.$emit('touchstart', event);
    },
    // Listen to touch move event
    touchMove(event) {
      this.$emit('touchmove', event);
    },
    // Listen to touch end event
    touchEnd(event) {
      this.$emit('touchend', event);
    },
    // Slide direction change
    slideChange(direction) {
      this.$emit('slidechange', direction);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../style/common.scss';

.hash-calendar {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
}

.calendar_inline {
  position: relative;
  width: 100%;
  height: auto;
  background: none;
  z-index: 1;
}

.calendar_content {
  position: absolute;
  width: 100%;
  left: 0;
  bottom: 0;
  display: flex;
  padding-bottom: px2vw(26px);
  flex-wrap: wrap;
  background: white;
  height: px2vw(710px);
  overflow: hidden;
}

.calendar_title {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  height: px2vw(56px);
  padding: px2vw(12px) px2vw(24px);
}

.calendar_title_date {
  @include viceFontColor('color');
  background: white;
}

.calendar_title_date_active {
  @include mainFontColor('color');
  font-weight: bold;
}

.calendar_title_date_time {
  margin-left: px2vw(20px);
}

.today_disable {
  @include disabledFontColor('color');
}

.ctrl-img {
  width: 100%;
  text-align: center;

  .ctrl-img-handler {
    width: 28px;
  }
}
</style>
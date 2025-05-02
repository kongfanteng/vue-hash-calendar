<template>
  <div class="calendar_body"
       :style="{ 'margin-top': calendarTitleHeight + 'px' }"
       v-show="show">
    <div class="calendar_week"
         ref="weekTitle">
      <div class="calendar_item"
           v-for="(item, index) in calendarWeek"
           :key="`${item}-${index}`">
        <p class="calendar_day">
          <slot name="week"
                :week="item">
            {{ item }}
          </slot>
        </p>
      </div>
    </div>
    <div class="calendar_group"
         :style="{ height: `${calendarGroupHeight}px` }"
         ref="calendar"
         @touchstart="touchStart"
         @touchmove="touchMove"
         @touchend="touchEnd">
      <ul :style="{ transform: `translate3d(${-translateIndex * 100}%, 0, 0)` }">
        <li class="calendar_group_li"
            v-for="(item, i) in calendarOfMonthShow"
            :key="i"
            :style="{
            transform: `translate3d(${
              (i - 1 + translateIndex + (isTouching ? touch.x : 0)) * 100
            }%, ${calendarY}px, 0)`,
            transitionDuration: `${isTouching ? 0 : transitionDuration}s`,
          }">
          <div class="calendar_item"
               ref="calendarItem"
               v-for="(date, j) in item"
               :class="
              formatDisabledDate(date) &&
              (disabledClassName || 'calendar_item_disable')
            "
               :key="i + j"
               @click="clickCalendarDay(date, j)">
            <div class="calendar_day"
                 :style="{ 'border-color': markDateColor(date, 'circle') }"
                 :class="[
                isToday(date) && (todayClassName || 'calendar_day_today'),
                isCheckedDay(date) &&
                  (checkedDayClassName || 'calendar_day_checked'),
                isNotCurrentMonthDay(date, i) &&
                  (notCurrentMonthDayClassName || 'calendar_day_not'),
              ]">
              <slot name="day"
                    :date="date"
                    :extendAttr="{
                  isMarked: !!(
                    markDateColor(date, 'circle') || markDateColor(date, 'dot')
                  ),
                  isDisabledDate: formatDisabledDate(date),
                  isToday: isToday(date),
                  isChecked: isCheckedDay(date),
                  isCurrentMonthDay: !isNotCurrentMonthDay(date, i),
                  isFirstDayOfMonth: isFirstDayOfMonth(date, i),
                }">
                {{ date.day }}
              </slot>
            </div>
            <div :style="{ background: markDateColor(date, 'dot', isCheckedDay(date)) }"
                 class="calendar_dot"></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {calculateCalendarOfMonth, daysOfMonth, formatDate, isDateInRange} from '../utils/util';
import languageUtil from '../language';

let timer = null;

export default {
    name: 'MrCalendar',
    props: {
        // Minimum selectable date
        minDate: {
            type: Date,
            default: null
        },
        // Maximum selectable date
        maxDate: {
            type: Date,
            default: null
        },
        // Class name for the first day of each month
        firstDayOfMonthClassName: {
            type: String,
            default: ''
        },
        // Height of the operation bar
        calendarTitleHeight: {
            type: Number,
            default: 0
        },
        // Class name for today's date
        todayClassName: {
            type: String,
            default: ''
        },
        // Class name for the selected date
        checkedDayClassName: {
            type: String,
            default: ''
        },
        // Class name for dates not in the current month (e.g., grayed-out dates at the beginning and end of the calendar)
        notCurrentMonthDayClassName: {
            type: String,
            default: ''
        },
        // Class name for disabled dates
        disabledClassName: {
            type: String,
            default: ''
        },
        // Whether to trigger date change when scrolling
        scrollChangeDate: {
            type: Boolean,
            default: true
        },
        // Disable week view
        disabledWeekView: {
            type: Boolean,
            default: false
        },
        defaultDate: {
            type: Date,
            default() {
                return new Date();
            }
        },
        show: {
            type: Boolean,
            default: false
        },
        weekStart: {
            type: String,
            default: 'Sunday'
        },
        // Whether to show dates not in the current month
        isShowNotCurrentMonthDay: {
            type: Boolean,
            default: true
        },
        // Whether to automatically switch months when clicking on dates not in the current month
        isAutoChangeMonth: {
            type: Boolean,
            default: true
        },
        // Whether to show week view
        isShowWeekView: {
            type: Boolean,
            default: false
        },
        // Marks below the dates
        markDate: {
            type: Array,
            default: () => []
        },
        // Type of date mark
        markType: {
            type: String,
            default: 'dot'
        },
        // Disabled dates
        disabledDate: {
            type: Function,
            default: () => {
                return false;
            }
        },
        // Disable scrolling, options: [left, right, up, down, horizontal, vertical, true, false]
        disabledScroll: {
            type: [Boolean, String],
            default: false
        },
        // Language pack to use
        lang: {
            type: String,
            default: 'EN'
        }
    },
    data() {
        return {
            language: {}, // Language pack to use
            yearOfCurrentShow: new Date().getFullYear(), // Year currently displayed in the calendar
            monthOfCurrentShow: new Date().getMonth(), // Month currently displayed in the calendar
            yearOfToday: new Date().getFullYear(), // Year of today
            monthOfToday: new Date().getMonth(), // Month of today
            dayOfToday: new Date().getDate(), // Day of today
            weekArray: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], // Week array
            calendarWeek: ['日', '一', '二', '三', '四', '五', '六'], // Week corresponding to the calendar
            calendarOfMonth: [], // Calendar table corresponding to the month
            calendarOfMonthShow: [], // Calendar table corresponding to the month
            calendarDaysTotalLength: 42, // Total number of days displayed in the calendar table, 6 rows and 7 columns
            lastMonthYear: null, // Year of the previous month
            lastMonth: null, // Month of the previous month
            nextMonthYear: null, // Year of the next month
            nextMonth: null, // Month of the next month
            checkedDate: {}, // Selected date
            weekStartIndex: 0, // Index of the first day of the week in the calendar
            translateIndex: 0, // Used to calculate the offset distance
            transitionDuration: 0.3, // Animation duration
            touch: {
                x: 0,
                y: 0
            }, // Distance of horizontal and vertical sliding in this touch event
            isTouching: false, // Whether it is currently sliding
            calendarGroupHeight: 0,
            calendarWeekTitleHeight: 0,
            calendarItemHeight: 0,
            touchStartPositionX: null, // X-axis value when starting to slide
            touchStartPositionY: null, // Y-axis value when starting to slide
            calendarY: 0, // Position of the calendar relative to the Y-axis
            selectedDayIndex: 0, // Currently selected date, the day of the week
            lastWeek: [], // Data of the previous week
            nextWeek: [], // Data of the next week
            isLastWeekInCurrentMonth: false, // Whether the data of the previous week is in the current month
            isNextWeekInCurrentMonth: false, // Whether the data of the next week is in the current month
            markDateColorObj: {}, // Colors corresponding to all marked dates
            markDateTypeObj: {} // Mark types corresponding to all marked dates
        };
    },
    mounted() {
        this.language = languageUtil[this.lang.toUpperCase()];
        this.calendarWeek = this.language.WEEK;
        this.weekStartIndex = this.weekArray.indexOf(this.weekStart.toLowerCase());
        this.calendarWeek = [
            ...this.calendarWeek.slice(this.weekStartIndex, this.calendarWeek.length),
            ...this.calendarWeek.slice(0, this.weekStartIndex)
        ];
    },
    watch: {
        markDate: {
            handler(val) {
                val.forEach((item, index) => {
                    if (!item.color) {
                        let obj = {};
                        obj.color = 'var(--Main-Color-Glod-Main-Color-4, #C2A15B)';
                        // fill: var(--Main-Color-Glod-Main-Color-4, #C2A15B);
                        if (typeof item === 'string' || typeof item === 'number') {
                            item = [item];
                        }
                        obj.date = item || [];
                        val[index] = obj;
                    }
                    val[index].type = item.type || this.markType || '';

                    val[index].date = this.dateFormat(val[index].date);
                });

                this.markDateColorObj = {};
                this.markDateTypeObj = {};
                val.forEach(item => {
                    item.date.forEach(date => {
                        this.$set(this.markDateColorObj, date, item.color);
                        this.$set(this.markDateTypeObj, date, item.type);
                    });
                });
            },
            deep: true,
            immediate: true
        },
        weekStartIndex() {
            this.calculateCalendarOfThreeMonth(this.checkedDate.year, this.checkedDate.month);
        },
        defaultDate: {
            handler(val) {
                if (!(val instanceof Date)) {
                    throw new Error("The calendar component's defaultDate must be date type!");
                }

                this.$set(this.checkedDate, 'year', val.getFullYear());
                this.$set(this.checkedDate, 'month', val.getMonth());
                this.$set(this.checkedDate, 'day', val.getDate());
                this.calculateCalendarOfThreeMonth(val.getFullYear(), val.getMonth());

                if (this.isShowWeek) {
                    this.showWeek();
                }
            },
            immediate: true
        },
        checkedDate: {
            handler(val) {
                this.$emit('change', val);
            },
            deep: true,
            immediate: true
        },
        show: {
            handler(val) {
                if (val) {
                    this.calculateCalendarOfThreeMonth(this.checkedDate.year, this.checkedDate.month);
                    this.initDom();
                }
            },
            immediate: true
        },
        isShowWeek: {
            handler(val) {
                if (val) {
                    this.$nextTick(() => {
                        this.showWeek();
                    });
                } else {
                    this.$nextTick(() => {
                        this.showMonth();
                    });
                }
            },
            immediate: true
        },
        calendarGroupHeight(val) {
            this.$emit('height', val + this.calendarWeekTitleHeight);
        }
    },
    computed: {
        // Whether the current calendar is displayed in week view
        isShowWeek: {
            get() {
                return this.isShowWeekView;
            },
            set(val) {
                this.$emit('update:isShowWeekView', val);
            }
        }
    },
    methods: {
        // Initialize calendar DOM
        initDom() {
            this.$nextTick(() => {
                this.calendarItemHeight = this.$refs.calendarItem && this.$refs.calendarItem[0].offsetHeight;
                this.calendarWeekTitleHeight = this.$refs.weekTitle.offsetHeight;

                let calendarItemGroup = this.$refs.calendarItem;
                calendarItemGroup.forEach(item => {
                    item.style.height = `${this.calendarItemHeight}px`;
                });

                if (this.isShowWeek) {
                    this.showWeek();
                } else {
                    this.showMonth();
                }

                this.calendarGroupHeight = this.calendarItemHeight * 6;
            });
        },
        // Today
        today() {
            this.$set(this.checkedDate, 'day', new Date().getDate());

            this.yearOfCurrentShow = new Date().getFullYear(); // Year currently displayed in the calendar
            this.monthOfCurrentShow = new Date().getMonth(); // Month currently displayed in the calendar

            this.calculateCalendarOfThreeMonth();

            if (this.isShowWeek) {
                setTimeout(() => {
                    this.isTouching = true;

                    this.$set(this.checkedDate, 'year', new Date().getFullYear());
                    this.$set(this.checkedDate, 'month', new Date().getMonth());

                    this.showWeek();
                }, this.transitionDuration * 1000);
            }
        },
        // Whether it is the first day of the current month
        isFirstDayOfMonth(date, i) {
            return date.day === 1 && !this.isNotCurrentMonthDay(date, i);
        },
        // Calculate the calendar information of the previous and next months of the currently displayed month. flag: -1: Get the calendar information of the previous month, 0: Current month information or cross-month display calendar information, 1: Get the calendar information of the next month
        calculateCalendarOfThreeMonth(year = new Date().getFullYear(), month = new Date().getMonth()) {
            this.lastMonthYear = month === 0 ? year - 1 : year; // Year of the previous month
            this.lastMonth = month === 0 ? 11 : month - 1; // Month of the previous month
            this.nextMonthYear = month === 11 ? year + 1 : year; // Year of the next month
            this.nextMonth = month === 11 ? 0 : month + 1; // Month of the next month

            let firstMonth = calculateCalendarOfMonth(
                this.lastMonthYear,
                this.lastMonth,
                this.weekStartIndex,
                this.isShowNotCurrentMonthDay
            );
            let secondMonth = calculateCalendarOfMonth(year, month, this.weekStartIndex, this.isShowNotCurrentMonthDay);
            let thirdMonth = calculateCalendarOfMonth(
                this.nextMonthYear,
                this.nextMonth,
                this.weekStartIndex,
                this.isShowNotCurrentMonthDay
            );

            this.calendarOfMonth = [];
            this.calendarOfMonth.push(firstMonth, secondMonth, thirdMonth);
            this.calendarOfMonthShow = JSON.parse(JSON.stringify(this.calendarOfMonth));

            if (!this.scrollChangeDate) return;

            // Change the selected date
            let tempDate = {};
            let day = this.checkedDate.day;
            if (day > 30 || (day > 28 && month === 1)) {
                day = daysOfMonth(year)[month];
            }
            tempDate = {day: day, year: year, month: month};

            if (this.formatDisabledDate(tempDate)) return;

            if (this.isShowWeek) return;

            this.$set(this.checkedDate, 'day', tempDate.day);
            this.$set(this.checkedDate, 'year', year);
            this.$set(this.checkedDate, 'month', month);
        },
        // Click on a date in the calendar
        clickCalendarDay(date, index) {
            if (!date || !date.day) return;

            if (this.formatDisabledDate(date)) return;

            this.$set(this.checkedDate, 'year', date.year);
            this.$set(this.checkedDate, 'month', date.month);
            this.$set(this.checkedDate, 'day', date.day);

            if (this.isAutoChangeMonth && date.month === this.lastMonth && date.year === this.lastMonthYear) {
                this.getLastMonth();
            }
            if (this.isAutoChangeMonth && date.month === this.nextMonth && date.year === this.nextMonthYear) {
                this.getNextMonth();
            }

            if (this.isShowWeek) {
                this.selectedDayIndex = index % 7;
                if (this.isAutoChangeMonth) {
                    this.showWeek();
                }
            }

            this.$emit('click', this.checkedDate);
        },
        // Whether the date is today
        isToday(date) {
            return this.yearOfToday === date.year && this.monthOfToday === date.month && this.dayOfToday === date.day;
        },
        // Whether the date is the selected date
        isCheckedDay(date) {
            if (this.formatDisabledDate(date)) return false;

            return this.checkedDate.year === date.year && this.checkedDate.month === date.month && this.checkedDate.day === date.day;
        },
        // Dates not in the current month
        isNotCurrentMonthDay(date, index) {
            let dateOfCurrentShow = this.calendarOfMonth[index][15]; // The date in the middle of the month must be in the current month
            return date.year !== dateOfCurrentShow.year || date.month !== dateOfCurrentShow.month;
        },
        // Listen to the touch start event
        touchStart(event) {
            this.$emit('touchstart', event);

            this.touchStartPositionX = event.touches[0].clientX;
            this.touchStartPositionY = event.touches[0].clientY;
            this.touch = {
                x: 0
            };
            this.isTouching = true;
        },
        // Listen to the touch move event
        touchMove(event) {
            this.$emit('touchmove', event);

            if (!this.disabledWeekView) {
                event.stopPropagation();
                event.preventDefault();
            }

            let moveX = event.touches[0].clientX - this.touchStartPositionX;
            let moveY = event.touches[0].clientY - this.touchStartPositionY;
            if (Math.abs(moveX) > Math.abs(moveY)) {
                if (this.isDisabledHorizontalScroll(moveX < 0 ? 'left' : 'right')) {
                    return;
                }

                this.touch = {
                    x: moveX / this.$refs.calendar.offsetWidth,
                    y: 0
                };
            } else {
                // Disable week view (disable vertical scrolling)
                if (this.disabledWeekView) return;

                this.touch = {
                    x: 0,
                    y: moveY / this.$refs.calendar.offsetHeight
                };
            }

            this.setDisabledScrollDirection();
        },
        // Listen to the touch end event
        touchEnd(e) {
            this.$emit('touchend', e);

            this.isTouching = false;
            if (Math.abs(this.touch.x) > Math.abs(this.touch.y) && Math.abs(this.touch.x) > 0.2) {
                if (this.touch.x > 0) {
                    this.$emit('slidechange', 'right');

                    this.getLastMonth();
                    if (this.isShowWeek) {
                        this.changeWeekView({isNext: false});
                    }
                } else if (this.touch.x < 0) {
                    this.$emit('slidechange', 'left');

                    this.getNextMonth();
                    if (this.isShowWeek) {
                        this.changeWeekView({isNext: true});
                    }
                }
            }
            if (Math.abs(this.touch.y) > Math.abs(this.touch.x) && Math.abs(this.touch.y * this.$refs.calendar.offsetHeight) > 50) {
                if (this.touch.y > 0 && this.isShowWeek) {
                    this.$emit('slidechange', 'down');

                    this.showMonth();
                } else if (this.touch.y < 0 && !this.isShowWeek) {
                    this.$emit('slidechange', 'up');

                    this.showWeek();
                }
            } else {
                this.touch = {
                    x: 0,
                    y: 0
                };
            }
        },
        // Display the calendar in month view
        showMonth() {
            this.calendarY = 0;
            this.isShowWeek = false;
            this.calendarGroupHeight = this.calendarItemHeight * 6;

            this.isLastWeekInCurrentMonth = false;
            this.isNextWeekInCurrentMonth = false;

            this.calculateCalendarOfThreeMonth(this.checkedDate.year, this.checkedDate.month);
        },
        // Display the calendar in week view
        showWeek(checkedDate = this.checkedDate) {
            let daysArr = [];
            this.calendarOfMonth[1].forEach(item => {
                daysArr.push(item.day);
            });
            let dayIndexOfMonth = daysArr.indexOf(checkedDate.day);
            // When the day is the last day of the month, there may be dates corresponding to the previous month in the front of daysArr, so lastIndexOf is needed
            if (checkedDate.day > 15) {
                dayIndexOfMonth = daysArr.lastIndexOf(checkedDate.day);
            }

            // Calculate which line the current date is in
            let indexOfLine = Math.ceil((dayIndexOfMonth + 1) / 7);
            let lastLine = indexOfLine - 1;
            this.calendarY = -(this.calendarItemHeight * lastLine);

            this.isShowWeek = true;
            this.calendarGroupHeight = this.calendarItemHeight;

            let currentWeek = [];
            let sliceStart = lastLine * 7;
            let sliceEnd = sliceStart + 7;
            this.isLastWeekInCurrentMonth = false;
            currentWeek = this.calendarOfMonth[1].slice(sliceStart, sliceEnd);
            for (let i in currentWeek) {
                if (currentWeek[i].day === checkedDate.day) {
                    this.selectedDayIndex = i;
                }
            }

            let firstDayOfCurrentWeek = currentWeek[0];
            let lastDayOfCurrentWeek = currentWeek[6];

            if (firstDayOfCurrentWeek.month !== checkedDate.month || firstDayOfCurrentWeek.day === 1) {
                if (this.calendarOfMonth[0].slice(28, 35)[6].month !== checkedDate.month) {
                    this.lastWeek = this.calendarOfMonth[0].slice(28, 35);
                } else {
                    this.lastWeek = this.calendarOfMonth[0].slice(21, 28);
                }
            } else {
                this.lastWeek = this.calendarOfMonth[1].slice(sliceStart - 7, sliceEnd - 7);
                if (this.lastWeek[this.selectedDayIndex] && this.lastWeek[this.selectedDayIndex].month === checkedDate.month) {
                    this.isLastWeekInCurrentMonth = true;
                }
            }

            this.isNextWeekInCurrentMonth = false;
            const cMonth = lastDayOfCurrentWeek.month;
            if (lastDayOfCurrentWeek.day < firstDayOfCurrentWeek.day && cMonth !== checkedDate.month) {
                this.nextWeek = this.calendarOfMonth[2].slice(7, 14);
            } else {
                if (lastDayOfCurrentWeek.day === daysOfMonth(lastDayOfCurrentWeek.year)[cMonth]) {
                    this.nextWeek = this.calendarOfMonth[2].slice(0, 7);
                } else {
                    this.nextWeek = this.calendarOfMonth[1].slice(sliceStart + 7, sliceEnd + 7);
                    if (this.nextWeek[this.selectedDayIndex].month === checkedDate.month) {
                        this.isNextWeekInCurrentMonth = true;
                    }
                }
            }
            this.calendarOfMonthShow[0].splice(sliceStart, 7, ...this.lastWeek);
            this.calendarOfMonthShow[2].splice(sliceStart, 7, ...this.nextWeek);
        },
        // Switch the displayed week
        changeWeekView({isNext}) {
            if (timer) timer = null;

            timer = setTimeout(() => {
                this.isTouching = true;
                isNext ? this.getNextWeek() : this.getLastWeek();
            }, this.transitionDuration * 1000);
        },
        // Display the previous week
        getLastWeek() {
            let checkedDate = this.lastWeek[this.selectedDayIndex];
            this.showWeek(checkedDate);

            if (this.formatDisabledDate(checkedDate)) return;

            if (!this.scrollChangeDate) return;

            this.checkedDate = checkedDate;
        },
        // Display the next week
        getNextWeek() {
            let checkedDate = this.nextWeek[this.selectedDayIndex];
            this.showWeek(checkedDate);

            if (this.formatDisabledDate(checkedDate)) return;

            if (!this.scrollChangeDate) return;

            this.checkedDate = checkedDate;
        },
        // Get the calendar of the previous month
        getLastMonth() {
            this.translateIndex += 1;

            if (!this.isLastWeekInCurrentMonth) {
                this.yearOfCurrentShow = this.lastMonthYear;
                this.monthOfCurrentShow = this.lastMonth;
            }

            this.calculateCalendarOfThreeMonth(this.yearOfCurrentShow, this.monthOfCurrentShow);
        },
        // Get the calendar of the next month
        getNextMonth() {
            this.translateIndex -= 1;

            if (!this.isNextWeekInCurrentMonth) {
                this.yearOfCurrentShow = this.nextMonthYear;
                this.monthOfCurrentShow = this.nextMonth;
            }

            this.calculateCalendarOfThreeMonth(this.yearOfCurrentShow, this.monthOfCurrentShow);
        },
        // Whether the current date needs to be marked
        markDateColor(date, type, isChecked = false) {
            let dateString = `${date.year}/${this.fillNumber(date.month + 1)}/${this.fillNumber(date.day)}`;
            let markDateTypeString = this.markDateTypeObj[dateString] || '';

            if (markDateTypeString.indexOf(type) === -1) return;
            return isChecked ? 'var(--Grey-Color-Grey-0, #FFF)' : this.markDateColorObj[dateString];
        },
        formatDisabledDate(date) {
            if (!date.day) return;

            let fDate = new Date(`${date.year}/${date.month + 1}/${date.day}`);

            return this.disabledDate(fDate) || !isDateInRange(fDate, this.minDate, this.maxDate);
        },
        // Disable further scrolling in the current horizontal direction (effective when minDate or maxDate is set)
        isDisabledHorizontalScroll(direc) {
            let minDate = this.minDate && this.minDate.getTime() - 24 * 60 * 60 * 1000;
            let maxDate = this.maxDate && this.maxDate.getTime();

            if (this.isShowWeek) {
                let lastWeekLastedDay = new Date(
                    `${this.lastWeek[6].year}/${this.lastWeek[6].month + 1}/${this.lastWeek[6].day}`
                ).getTime();
                let nextWeekFirstDay = new Date(`${this.nextWeek[0].year}/${this.nextWeek[0].month + 1}/${this.nextWeek[0].day}`).getTime();
                if (direc === 'left' && maxDate) return nextWeekFirstDay >= maxDate;
                if (direc === 'right' && minDate) return lastWeekLastedDay <= minDate;
            } else {
                let lastMonthLastedDay = new Date(
                    `${this.lastMonthYear}/${this.lastMonth + 1}/${daysOfMonth(this.lastMonthYear)[this.lastMonth]}`
                ).getTime();
                let nextMonthFirstDay = new Date(`${this.nextMonthYear}/${this.nextMonth + 1}/1`).getTime();
                if (direc === 'left' && maxDate) return nextMonthFirstDay >= maxDate;
                if (direc === 'right' && minDate) return lastMonthLastedDay <= minDate;
            }

            return false;
        },
        // Add 0 in front of numbers less than 10
        fillNumber(val) {
            return val > 9 ? val : '0' + val;
        },
        // Date format conversion
        dateFormat(dateArr){
            dateArr.forEach((date, index) => {
                dateArr[index] = formatDate(date, 'YY/MM/DD');
            });

            return dateArr;
        },
        isCanScroll(dire) {
            const scrollObj = {
                up: [true, 'up', 'vertical'],
                down: [true, 'down', 'vertical'],
                left: [true, 'left', 'horizontal'],
                right: [true, 'right', 'horizontal']
            };

            let checkedScrollArr = scrollObj[dire];
            return !checkedScrollArr.some(item => item === this.disabledScroll);
        },
        setDisabledScrollDirection() {
            this.touch.x < 0 && !this.isCanScroll('left') && (this.touch.x = 0);
            this.touch.x > 0 && !this.isCanScroll('right') && (this.touch.x = 0);
            this.touch.y < 0 && !this.isCanScroll('up') && (this.touch.y = 0);
            this.touch.y > 0 && !this.isCanScroll('down') && (this.touch.y = 0);
        }
    }
};
</script>

<style lang="scss" scoped>
@use '../style/common.scss';

.calendar_body {
    position: relative;
    width: 100%;
    margin-top: common.px2vw(100px);
}

.calendar_week {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    @include common.flexAlign();
    background: white;
    @include common.viceFontColor('color');
    z-index: 2;
    .calendar_day {
        color: var(--Grey-Color-Grey-10, #141414);
    }
}

.calendar_group {
    position: absolute;
    top: common.px2vw(49px);
    left: 0;
    bottom: 0;
    right: 0;
    overflow: hidden;
    transition: height 0.3s;
    -webkit-transition: height 0.3s;
    ul {
        height: 100%;
    }
}

.calendar_group_li {
    position: absolute;
    top: 0;
    // left: common.px2vw(4px);
    bottom: 0;
    right: 0;
    height: 100%;
    width: 100%;
    @include common.flexAlign();
    flex-wrap: wrap;
    background: white;
    will-change: transform;
}

.calendar_item {
    width: 14.13333335%;
    @include common.flexContent();
    flex-direction: column;
    padding: common.px2vw(2px) 0;
    position: relative;
}

.calendar_item_disable {
    @include common.disabledBgColor('background-color');
    opacity: 1;
    cursor: not-allowed;
    @include common.disabledFontColor('color');
}

.calendar_day {
    width: common.px2vw(40px);
    height: common.px2vw(40px);
    border-radius: 50%;
    @include common.fontSize(16px);
    @include common.flexContent();
    margin-bottom: common.px2vw(5px);
    color: var(--Grey-Color-Grey-6, #737373);
    font-style: normal;
    font-weight: 500;
}

.calendar_first_today {
    @include common.mainColor('color');

    span {
        @include common.fontSize(20px);
        margin-top: common.px2vw(3px);
    }
}

.calendar_day_today {
    @include common.bgColor('background');
}

.calendar_mark_circle {
    @include common.mainColor('border');
}

.calendar_day_not {
    @include common.disabledFontColor('color');
}

.calendar_day_checked {
    @include common.mainColor('background');
    color: white;
}

.calendar_dot {
    width: common.px2vw(6px);
    height: common.px2vw(6px);
    border-radius: 50%;
    position: absolute;
    bottom: common.px2vw(10px);
}
</style>

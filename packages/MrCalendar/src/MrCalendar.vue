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
import {
  calculateCalendarOfMonth,
  daysOfMonth,
  formatDate,
  isDateInRange,
} from '../utils/util';
import languageUtil from '../language';

let timer = null;

export default {
  name: 'MrCalendar',
  props: {
    // 最小可选日期
    minDate: {
      type: Date,
      default: null,
    },
    // 最大可选日期
    maxDate: {
      type: Date,
      default: null,
    },
    // 每月第一天的 className
    firstDayOfMonthClassName: {
      type: String,
      default: '',
    },
    // 操作栏高度
    calendarTitleHeight: {
      type: Number,
      default: 0,
    },
    // 当天日期的 className
    todayClassName: {
      type: String,
      default: '',
    },
    // 日期被选中时的 className
    checkedDayClassName: {
      type: String,
      default: '',
    },
    // 不是当前展示月份日期的 className(例如日历前面几天与后面几天灰色部分)
    notCurrentMonthDayClassName: {
      type: String,
      default: '',
    },
    // 日期被禁用时的 className
    disabledClassName: {
      type: String,
      default: '',
    },
    // 滑动的时候，是否触发改变日期
    scrollChangeDate: {
      type: Boolean,
      default: true,
    },
    // 禁用周视图
    disabledWeekView: {
      type: Boolean,
      default: false,
    },
    defaultDate: {
      type: Date,
      default() {
        return new Date();
      },
    },
    show: {
      type: Boolean,
      default: false,
    },
    weekStart: {
      type: String,
      default: 'Sunday',
    },
    // 是否展示非本月日期
    isShowNotCurrentMonthDay: {
      type: Boolean,
      default: true,
    },
    // 点击非本月日期是否自动切换月份
    isAutoChangeMonth: {
      type: Boolean,
      default: true,
    },
    // 是否展示周视图
    isShowWeekView: {
      type: Boolean,
      default: false,
    },
    // 日期下面的标记
    markDate: {
      type: Array,
      default: () => [],
    },
    // 日期标记类型
    markType: {
      type: String,
      default: 'dot',
    },
    // 禁用的日期
    disabledDate: {
      type: Function,
      default: () => {
        return false;
      },
    },
    // 禁止滑动，可选值 [left, right, up, down, horizontal, vertical, true, false]
    disabledScroll: {
      type: [Boolean, String],
      default: false,
    },
    // 使用的语言包
    lang: {
      type: String,
      default: 'EN',
    },
  },
  data() {
    return {
      language: {}, // 使用的语言包
      yearOfCurrentShow: new Date().getFullYear(), // 当前日历展示的年份
      monthOfCurrentShow: new Date().getMonth(), // 当前日历展示的月份
      yearOfToday: new Date().getFullYear(), // 今天所在的年份
      monthOfToday: new Date().getMonth(), // 今天所在的月份
      dayOfToday: new Date().getDate(), // 今天所在的日期
      weekArray: [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ], // 星期数组
      calendarWeek: ['日', '一', '二', '三', '四', '五', '六'], // 日历对应的星期
      calendarOfMonth: [], // 月份对应的日历表
      calendarOfMonthShow: [], // 月份对应的日历表
      calendarDaysTotalLength: 42, // 日历表展示的总天数  6行7列
      lastMonthYear: null, // 上个月的年份
      lastMonth: null, // 上个月的月份
      nextMonthYear: null, // 下个月的年份
      nextMonth: null, // 下个月的月份
      checkedDate: {}, // 被选中的日期
      weekStartIndex: 0, // 日历第一天星期名称的index
      translateIndex: 0, // 用于计算上下偏移的距离
      transitionDuration: 0.3, // 动画持续时间
      touch: {
        x: 0,
        y: 0,
      }, // 本次touch事件，横向，纵向滑动的距离
      isTouching: false, // 是否正在滑动
      calendarGroupHeight: 0,
      calendarWeekTitleHeight: 0,
      calendarItemHeight: 0,
      touchStartPositionX: null, // 开始滑动x轴的值
      touchStartPositionY: null, // 开始滑动时y轴的值
      calendarY: 0, // 日历相对于Y轴的位置
      selectedDayIndex: 0, // 当前选中的日期，在这一周的第几天
      lastWeek: [], // 上一周的数据
      nextWeek: [], // 下一周的数据
      isLastWeekInCurrentMonth: false, // 上一周的数据是否在本月
      isNextWeekInCurrentMonth: false, // 下一周的数据是否在本月
      markDateColorObj: {}, // 所有被标记的日期所对应的颜色
      markDateTypeObj: {}, // 所有被标记的日期所对应的标记类型
    };
  },
  mounted() {
    this.language = languageUtil[this.lang.toUpperCase()];
    this.calendarWeek = this.language.WEEK;
    this.weekStartIndex = this.weekArray.indexOf(this.weekStart.toLowerCase());
    this.calendarWeek = [
      ...this.calendarWeek.slice(this.weekStartIndex, this.calendarWeek.length),
      ...this.calendarWeek.slice(0, this.weekStartIndex),
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
        val.forEach((item) => {
          item.date.forEach((date) => {
            this.$set(this.markDateColorObj, date, item.color);
            this.$set(this.markDateTypeObj, date, item.type);
          });
        });
      },
      deep: true,
      immediate: true,
    },
    weekStartIndex() {
      this.calculateCalendarOfThreeMonth(
        this.checkedDate.year,
        this.checkedDate.month
      );
    },
    defaultDate: {
      handler(val) {
        if (!(val instanceof Date)) {
          throw new Error(
            "The calendar component's defaultDate must be date type!"
          );
        }

        this.$set(this.checkedDate, 'year', val.getFullYear());
        this.$set(this.checkedDate, 'month', val.getMonth());
        this.$set(this.checkedDate, 'day', val.getDate());
        this.calculateCalendarOfThreeMonth(val.getFullYear(), val.getMonth());

        if (this.isShowWeek) {
          this.showWeek();
        }
      },
      immediate: true,
    },
    checkedDate: {
      handler(val) {
        this.$emit('change', val);
      },
      deep: true,
      immediate: true,
    },
    show: {
      handler(val) {
        if (val) {
          this.calculateCalendarOfThreeMonth(
            this.checkedDate.year,
            this.checkedDate.month
          );
          this.initDom();
        }
      },
      immediate: true,
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
      immediate: true,
    },
    calendarGroupHeight(val) {
      this.$emit('height', val + this.calendarWeekTitleHeight);
    },
  },
  computed: {
    // 当前日历是否以星期方式展示
    isShowWeek: {
      get() {
        return this.isShowWeekView;
      },
      set(val) {
        this.$emit('update:isShowWeekView', val);
      },
    },
  },
  methods: {
    // 初始化日历dom
    initDom() {
      this.$nextTick(() => {
        this.calendarItemHeight =
          this.$refs.calendarItem && this.$refs.calendarItem[0].offsetHeight;
        this.calendarWeekTitleHeight = this.$refs.weekTitle.offsetHeight;

        let calendarItemGroup = this.$refs.calendarItem;
        calendarItemGroup.forEach((item) => {
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
    // 今天
    today() {
      this.$set(this.checkedDate, 'day', new Date().getDate());

      this.yearOfCurrentShow = new Date().getFullYear(); // 当前日历展示的年份
      this.monthOfCurrentShow = new Date().getMonth(); // 当前日历展示的月份

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
    // 是否为当前月的第一天
    isFirstDayOfMonth(date, i) {
      return date.day === 1 && !this.isNotCurrentMonthDay(date, i);
    },
    // 计算当前展示月份的前后月份日历信息 flag  -1:获取上个月日历信息   0:当月信息或者跨月展示日历信息  1:获取下个月日历信息
    calculateCalendarOfThreeMonth(
      year = new Date().getFullYear(),
      month = new Date().getMonth()
    ) {
      this.lastMonthYear = month === 0 ? year - 1 : year; // 上个月的年份
      this.lastMonth = month === 0 ? 11 : month - 1; // 上个月的月份
      this.nextMonthYear = month === 11 ? year + 1 : year; // 下个月的年份
      this.nextMonth = month === 11 ? 0 : month + 1; // 下个月的月份

      let firstMonth = calculateCalendarOfMonth(
        this.lastMonthYear,
        this.lastMonth,
        this.weekStartIndex,
        this.isShowNotCurrentMonthDay
      );
      let secondMonth = calculateCalendarOfMonth(
        year,
        month,
        this.weekStartIndex,
        this.isShowNotCurrentMonthDay
      );
      let thirdMonth = calculateCalendarOfMonth(
        this.nextMonthYear,
        this.nextMonth,
        this.weekStartIndex,
        this.isShowNotCurrentMonthDay
      );

      this.calendarOfMonth = [];
      this.calendarOfMonth.push(firstMonth, secondMonth, thirdMonth);
      this.calendarOfMonthShow = JSON.parse(
        JSON.stringify(this.calendarOfMonth)
      );

      if (!this.scrollChangeDate) return;

      // 改变日期选择的日期
      let tempDate = {};
      let day = this.checkedDate.day;
      if (day > 30 || (day > 28 && month === 1)) {
        day = daysOfMonth(year)[month];
      }
      tempDate = { day: day, year: year, month: month };

      if (this.formatDisabledDate(tempDate)) return;

      if (this.isShowWeek) return;

      this.$set(this.checkedDate, 'day', tempDate.day);
      this.$set(this.checkedDate, 'year', year);
      this.$set(this.checkedDate, 'month', month);
    },
    // 点击日历上的日期
    clickCalendarDay(date, index) {
      if (!date || !date.day) return;

      if (this.formatDisabledDate(date)) return;

      this.$set(this.checkedDate, 'year', date.year);
      this.$set(this.checkedDate, 'month', date.month);
      this.$set(this.checkedDate, 'day', date.day);

      if (
        this.isAutoChangeMonth &&
        date.month === this.lastMonth &&
        date.year === this.lastMonthYear
      ) {
        this.getLastMonth();
      }
      if (
        this.isAutoChangeMonth &&
        date.month === this.nextMonth &&
        date.year === this.nextMonthYear
      ) {
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
    // 该日期是否为今天
    isToday(date) {
      return (
        this.yearOfToday === date.year &&
        this.monthOfToday === date.month &&
        this.dayOfToday === date.day
      );
    },
    // 该日期是否为选中的日期
    isCheckedDay(date) {
      if (this.formatDisabledDate(date)) return false;

      return (
        this.checkedDate.year === date.year &&
        this.checkedDate.month === date.month &&
        this.checkedDate.day === date.day
      );
    },
    // 非本月日期
    isNotCurrentMonthDay(date, index) {
      let dateOfCurrentShow = this.calendarOfMonth[index][15]; // 本月中间的日期一定为本月
      return (
        date.year !== dateOfCurrentShow.year ||
        date.month !== dateOfCurrentShow.month
      );
    },
    // 监听手指开始滑动事件
    touchStart(event) {
      this.$emit('touchstart', event);

      this.touchStartPositionX = event.touches[0].clientX;
      this.touchStartPositionY = event.touches[0].clientY;
      this.touch = {
        x: 0,
      };
      this.isTouching = true;
    },
    // 监听手指移动事件
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
          y: 0,
        };
      } else {
        // 禁用周视图（禁止上下滑动）
        if (this.disabledWeekView) return;

        this.touch = {
          x: 0,
          y: moveY / this.$refs.calendar.offsetHeight,
        };
      }

      this.setDisabledScrollDirection();
    },
    // 监听touch结束事件
    touchEnd(e) {
      this.$emit('touchend', e);

      this.isTouching = false;
      if (
        Math.abs(this.touch.x) > Math.abs(this.touch.y) &&
        Math.abs(this.touch.x) > 0.2
      ) {
        if (this.touch.x > 0) {
          this.$emit('slidechange', 'right');

          this.getLastMonth();
          if (this.isShowWeek) {
            this.changeWeekView({ isNext: false });
          }
        } else if (this.touch.x < 0) {
          this.$emit('slidechange', 'left');

          this.getNextMonth();
          if (this.isShowWeek) {
            this.changeWeekView({ isNext: true });
          }
        }
      }
      if (
        Math.abs(this.touch.y) > Math.abs(this.touch.x) &&
        Math.abs(this.touch.y * this.$refs.calendar.offsetHeight) > 50
      ) {
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
          y: 0,
        };
      }
    },
    // 日历以月份方式展示
    showMonth() {
      this.calendarY = 0;
      this.isShowWeek = false;
      this.calendarGroupHeight = this.calendarItemHeight * 6;

      this.isLastWeekInCurrentMonth = false;
      this.isNextWeekInCurrentMonth = false;

      this.calculateCalendarOfThreeMonth(
        this.checkedDate.year,
        this.checkedDate.month
      );
    },
    // 日历以星期方式展示
    showWeek(checkedDate = this.checkedDate) {
      let daysArr = [];
      this.calendarOfMonth[1].forEach((item) => {
        daysArr.push(item.day);
      });
      let dayIndexOfMonth = daysArr.indexOf(checkedDate.day);
      // 当day为月底的天数时，有可能在daysArr的前面也存在上一个月对应的日期，所以需要取lastIndexOf
      if (checkedDate.day > 15) {
        dayIndexOfMonth = daysArr.lastIndexOf(checkedDate.day);
      }

      // 计算当前日期在第几行
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

      if (
        firstDayOfCurrentWeek.month !== checkedDate.month ||
        firstDayOfCurrentWeek.day === 1
      ) {
        if (
          this.calendarOfMonth[0].slice(28, 35)[6].month !== checkedDate.month
        ) {
          this.lastWeek = this.calendarOfMonth[0].slice(28, 35);
        } else {
          this.lastWeek = this.calendarOfMonth[0].slice(21, 28);
        }
      } else {
        this.lastWeek = this.calendarOfMonth[1].slice(
          sliceStart - 7,
          sliceEnd - 7
        );
        if (
          this.lastWeek[this.selectedDayIndex] &&
          this.lastWeek[this.selectedDayIndex].month === checkedDate.month
        ) {
          this.isLastWeekInCurrentMonth = true;
        }
      }

      this.isNextWeekInCurrentMonth = false;
      const cMonth = lastDayOfCurrentWeek.month;
      if (
        lastDayOfCurrentWeek.day < firstDayOfCurrentWeek.day &&
        cMonth !== checkedDate.month
      ) {
        this.nextWeek = this.calendarOfMonth[2].slice(7, 14);
      } else {
        if (
          lastDayOfCurrentWeek.day ===
          daysOfMonth(lastDayOfCurrentWeek.year)[cMonth]
        ) {
          this.nextWeek = this.calendarOfMonth[2].slice(0, 7);
        } else {
          this.nextWeek = this.calendarOfMonth[1].slice(
            sliceStart + 7,
            sliceEnd + 7
          );
          if (
            this.nextWeek[this.selectedDayIndex].month === checkedDate.month
          ) {
            this.isNextWeekInCurrentMonth = true;
          }
        }
      }
      this.calendarOfMonthShow[0].splice(sliceStart, 7, ...this.lastWeek);
      this.calendarOfMonthShow[2].splice(sliceStart, 7, ...this.nextWeek);
    },
    // 切换展示的星期
    changeWeekView({ isNext }) {
      if (timer) timer = null;

      timer = setTimeout(() => {
        this.isTouching = true;
        isNext ? this.getNextWeek() : this.getLastWeek();
      }, this.transitionDuration * 1000);
    },
    // 显示上一周
    getLastWeek() {
      let checkedDate = this.lastWeek[this.selectedDayIndex];
      this.showWeek(checkedDate);

      if (this.formatDisabledDate(checkedDate)) return;

      if (!this.scrollChangeDate) return;

      this.checkedDate = checkedDate;
    },
    // 显示下一周
    getNextWeek() {
      let checkedDate = this.nextWeek[this.selectedDayIndex];
      this.showWeek(checkedDate);

      if (this.formatDisabledDate(checkedDate)) return;

      if (!this.scrollChangeDate) return;

      this.checkedDate = checkedDate;
    },
    // 获取上个月日历
    getLastMonth() {
      this.translateIndex += 1;

      if (!this.isLastWeekInCurrentMonth) {
        this.yearOfCurrentShow = this.lastMonthYear;
        this.monthOfCurrentShow = this.lastMonth;
      }

      this.calculateCalendarOfThreeMonth(
        this.yearOfCurrentShow,
        this.monthOfCurrentShow
      );
    },
    // 获取下个月日历
    getNextMonth() {
      this.translateIndex -= 1;

      if (!this.isNextWeekInCurrentMonth) {
        this.yearOfCurrentShow = this.nextMonthYear;
        this.monthOfCurrentShow = this.nextMonth;
      }

      this.calculateCalendarOfThreeMonth(
        this.yearOfCurrentShow,
        this.monthOfCurrentShow
      );
    },
    // 当前日期是否需要标记
    markDateColor(date, type, isChecked = false) {
      let dateString = `${date.year}/${this.fillNumber(
        date.month + 1
      )}/${this.fillNumber(date.day)}`;
      let markDateTypeString = this.markDateTypeObj[dateString] || '';

      if (markDateTypeString.indexOf(type) === -1) return;
      return isChecked
        ? 'var(--Grey-Color-Grey-0, #FFF)'
        : this.markDateColorObj[dateString];
    },
    formatDisabledDate(date) {
      if (!date.day) return;

      let fDate = new Date(`${date.year}/${date.month + 1}/${date.day}`);

      return (
        this.disabledDate(fDate) ||
        !isDateInRange(fDate, this.minDate, this.maxDate)
      );
    },
    // 禁止继续往横向的当前方向滑动 （当设置 minDate 或 maxDate 时生效）
    isDisabledHorizontalScroll(direc) {
      let minDate =
        this.minDate && this.minDate.getTime() - 24 * 60 * 60 * 1000;
      let maxDate = this.maxDate && this.maxDate.getTime();

      if (this.isShowWeek) {
        let lastWeekLastedDay = new Date(
          `${this.lastWeek[6].year}/${this.lastWeek[6].month + 1}/${
            this.lastWeek[6].day
          }`
        ).getTime();
        let nextWeekFirstDay = new Date(
          `${this.nextWeek[0].year}/${this.nextWeek[0].month + 1}/${
            this.nextWeek[0].day
          }`
        ).getTime();
        if (direc === 'left' && maxDate) return nextWeekFirstDay >= maxDate;
        if (direc === 'right' && minDate) return lastWeekLastedDay <= minDate;
      } else {
        let lastMonthLastedDay = new Date(
          `${this.lastMonthYear}/${this.lastMonth + 1}/${
            daysOfMonth(this.lastMonthYear)[this.lastMonth]
          }`
        ).getTime();
        let nextMonthFirstDay = new Date(
          `${this.nextMonthYear}/${this.nextMonth + 1}/1`
        ).getTime();
        if (direc === 'left' && maxDate) return nextMonthFirstDay >= maxDate;
        if (direc === 'right' && minDate) return lastMonthLastedDay <= minDate;
      }

      return false;
    },
    // 小于10，在前面补0
    fillNumber(val) {
      return val > 9 ? val : '0' + val;
    },
    // 日期格式转换
    dateFormat(dateArr) {
      dateArr.forEach((date, index) => {
        dateArr[index] = formatDate(date, 'YY/MM/DD');
      });

      return dateArr;
    },
    // 是否可以滑动
    isCanScroll(dire) {
      const scrollObj = {
        up: [true, 'up', 'vertical'],
        down: [true, 'down', 'vertical'],
        left: [true, 'left', 'horizontal'],
        right: [true, 'right', 'horizontal'],
      };

      let checkedScrollArr = scrollObj[dire];
      return !checkedScrollArr.some((item) => item === this.disabledScroll);
    },
    // 设置禁止滑动的方向
    setDisabledScrollDirection() {
      this.touch.x < 0 && !this.isCanScroll('left') && (this.touch.x = 0);
      this.touch.x > 0 && !this.isCanScroll('right') && (this.touch.x = 0);
      this.touch.y < 0 && !this.isCanScroll('up') && (this.touch.y = 0);
      this.touch.y > 0 && !this.isCanScroll('down') && (this.touch.y = 0);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../style/common.scss';

.calendar_body {
  position: relative;
  width: 100%;
  margin-top: px2vw(100px);
}

.calendar_week {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  @include flexAlign();
  background: white;
  @include viceFontColor('color');
  z-index: 2;
}

.calendar_group {
  position: absolute;
  top: px2vw(49px);
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
  left: px2vw(4px);
  bottom: 0;
  right: 0;
  height: 100%;
  width: 100%;
  @include flexAlign();
  flex-wrap: wrap;
  background: white;
  will-change: transform;
}

.calendar_item {
  width: 14.13333335%;
  @include flexContent();
  flex-direction: column;
  padding: px2vw(2px) 0;
  position: relative;
}

.calendar_item_disable {
  @include disabledBgColor('background-color');
  opacity: 1;
  cursor: not-allowed;
  @include disabledFontColor('color');
}

.calendar_day {
  width: px2vw(40px);
  height: px2vw(40px);
  border-radius: 50%;
  @include fontSize(16px);
  @include flexContent();
  margin-bottom: px2vw(5px);
}

.calendar_first_today {
  @include mainColor('color');

  span {
    @include fontSize(20px);
    margin-top: px2vw(3px);
  }
}

.calendar_day_today {
  @include bgColor('background');
}

.calendar_mark_circle {
  @include mainColor('border');
}

.calendar_day_not {
  @include disabledFontColor('color');
}

.calendar_day_checked {
  @include mainColor('background');
  color: white;
}

.calendar_dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: absolute;
  bottom: px2vw(12px);
}
</style>

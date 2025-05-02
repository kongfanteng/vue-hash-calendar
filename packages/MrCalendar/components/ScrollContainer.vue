<template>
  <ul class="calendar_group_ul"
      ref="container"
      :style="{'transform': `translate3d(${-translateIndex*100}%, 0, 0)`}"
      @touchstart="touchStart"
      @touchmove.stop.prevent="touchMove"
      @touchend="touchEnd">
    <li class="calendar_group_li"
        v-for="(item, i) in calendarData"
        :key="i"
        :style="{transform: `translate3d(${(i-1+translateIndex + (isTouching ? touch.x : 0))*100}%, ${calendarY}px, 0)`,transitionDuration: `${isTouching ? 0 : transitionDuration}s`,}">
      <slot :currArr="item"></slot>
    </li>
  </ul>
</template>

<script>
export default {
    name: 'ScrollContainer',
    props: {
        // Disable scrolling, options [left, right, up, down, horizontal, vertical, true, false]
        disabledScroll: {
            type: [Boolean, String],
            default: false
        },
        // Calendar data
        calendarData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            translateIndex: 0, // Used to calculate the offset distance
            transitionDuration: 0.3, // Animation duration
            touch: {
                x: 0,
                y: 0
            }, // The distance of horizontal and vertical sliding in this touch event
            isTouching: false, // Whether it is currently sliding
            touchStartPositionX: null, // The starting position of the X-axis
            touchStartPositionY: null, // The starting position of the Y-axis
            calendarY: 0 // The position of the calendar relative to the Y-axis
        };
    },
    methods: {
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

            let moveX = event.touches[0].clientX - this.touchStartPositionX;
            let moveY = event.touches[0].clientY - this.touchStartPositionY;
            if (Math.abs(moveX) > Math.abs(moveY)) {
                this.touch = {
                    x: moveX / this.$refs.container.offsetWidth,
                    y: 0
                };
            } else {
                this.touch = {
                    x: 0,
                    y: moveY / this.$refs.container.offsetHeight
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

                    this.translateIndex += 1;
                } else if (this.touch.x < 0) {
                    this.$emit('slidechange', 'left');

                    this.translateIndex -= 1;
                }
            }
            if (Math.abs(this.touch.y) > Math.abs(this.touch.x) && Math.abs(this.touch.y * this.$refs.container.offsetHeight) > 50) {
                if (this.touch.y > 0 && this.isShowWeek) {
                    this.$emit('slidechange', 'down');
                } else if (this.touch.y < 0 && !this.isShowWeek) {
                    this.$emit('slidechange', 'up');
                }
            } else {
                this.touch = {
                    x: 0,
                    y: 0
                };
            }
        },
        // Check if scrolling is allowed
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
        // Set the direction of disabled scrolling
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

.calendar_group_ul {
    height: 100%;
    width: 100%;
    background: white;
}
.calendar_group_li {
    position: absolute;
    top: 0;
    left: common.px2vw(4px);
    bottom: 0;
    right: 0;
    height: 100%;
    width: 100%;
    @include common.flexAlign();
    flex-wrap: wrap;
    background: white;
    will-change: transform;
}
</style>
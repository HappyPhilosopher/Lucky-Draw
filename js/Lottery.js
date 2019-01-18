'use strict';
(function() {
    let that = null;  // 绑定 this
    let num = 0;  // 记录初始化 speed 值

    class Lottery {
        constructor(selector, param) {
            this.curPoint = -1;  // 当前位置
            this.prize = 0;  // 奖品，可设置概率
            this.cycle = 0;  // 运行周期，每运动一周加 1
            this.timer = null;  // 定时器
            this.selector = document.querySelector(selector);
            this.itemArr = this.selector.querySelectorAll('.item');  // 限定了容器中奖品项 class 必须为 item
            this.speed = param.speed;
            this.maxSpeed = param.maxSpeed;
            this.acceleration = param.acceleration;
            this.targetCycle = param.targetCycle;
            this.speedUpCycle = param.speedUpCycle;
            this.speedDownCycle = param.speedDownCycle;
            this.param = param;

            that = this;  // 绑定 this 指向
            num = this.speed;  // 记录初始化 speed 值 
        }

        init() {
            clearInterval(this.timer);  // 清除定时器
            // 清除所有背景色
            this.itemArr.forEach(item => {
                item.classList.remove('bgc-red');
            });
            this.cycle = 0;  // 初始化周期数，因为抽奖开始后会改变周期数
            this.speed = num;  // 初始化速度
            // 为奖品附加概率值
            let randomNum = Math.floor(Math.random() * 100 + 1);
            let limitValueObj = this.getLimitValue();
            limitValueObj.forEach((item, index) => {
                if (randomNum >= item.min && randomNum <= item.max) {
                    this.prize = index;
                }
            });
            this.start();
        }

        roll() {
            flag = false;
            /* 绕按钮做环绕运动。每绕一周记录一次周期。 */
            this.curPoint++;
            if (this.curPoint > this.itemArr.length - 1) {
                this.curPoint = 0;
                this.cycle++;
            }
            /* 排他思想，仅当前位置改变样式 */
            this.itemArr.forEach(item => {
                item.classList.remove('bgc-red');
            });
            document.querySelector(`.item${this.curPoint}`).classList.add('bgc-red');
            /* 
             * 仅在当前速度小于最大速度且运行周期不大于加速周期时进行加速处理
             * 当运行周期不小于减速周期时进行减速处理，这样在抽奖停止时比较自然
             */
            if (this.speed > this.maxSpeed && this.cycle <= this.speedUpCycle) {
                this.speed -= this.acceleration;
                this.stop();
                this.start();
            } else if (this.cycle >= this.speedDownCycle) {
                this.speed += this.acceleration;
                this.stop();
                this.start();
            }
            /* 当运行周期与目标周期一致，且当前位置与奖品索引一致时，停止定时器并弹出相应文本 */
            if (this.cycle === this.targetCycle  && this.curPoint === this.prize) {
                this.stop();
                setTimeout(() => {
                    let text = document.querySelector(`.item${this.curPoint}`).innerHTML;
                    if (this.curPoint === 7) {
                        alert(`${text}!`);
                    } else {
                        alert(`恭喜您获得${text}！`);
                        flag = true;
                    }
                }, 500);
            }
            
            // 记录当前速度、周期和奖励
            console.log(`${this.speed} === ${this.cycle} === ${this.prize + 1}`);
        }
        
        start() {
            this.timer = setInterval(function() {
                this.roll();
            }.bind(that), this.speed);
        }

        stop() {
            clearInterval(this.timer);
        }

        getLimitValue() {
            // 存放百分制得到的概率对象值
            let numArr = [];
            // 遍历概率对象并将值存放在 numArr
            for (const key in this.param.probability) {
                numArr.push(Number.parseInt(this.param.probability[key]) * 0.01 * 100);  //百分制
            }
            // numArr 按从小到大排序
            numArr.sort((min, max) => {
                return min - max;
            });

            // 存放最大、最小范围的对象
            let objArr = [];
            objArr[0] = {min: 1, max: 1};
            function getRange(arr) {
                arr.forEach((item, index) => {
                    if (index > 0) {
                        let obj = {};
                        obj.min = 1 + objArr[index - 1].max;
                        obj.max = item + objArr[index - 1].max;
                        objArr.push(obj);
                    }
                });
            }
            getRange(numArr);
            return objArr;
        }
    }

    // 暴露给 window
    window.Lottery = Lottery;
}());
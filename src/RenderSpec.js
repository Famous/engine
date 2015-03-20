var Specification = {};

Specification.Internal = function Internal () {
    this.mounted = false;
    this.shown = false;
    this.opacity = 1;
    this.location = {
        align: null,
        mountPoint: null,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
    };
    this.size = {
        proportional: [1, 1, 1],
        differential: [0, 0, 0],
        absolute: [0, 0, 0]
    };
}

Specification.Internal.diff = function diff (a, b, report) {
    report = report ? report.clear() : new Specification.Internal.Report();
    calcMountShowOpacity(a, b, report);
    report.alignChanged(calcOptionalVec3(a.location.align, b.location.align));
    report.mountPointChanged(calcOptionalVec3(a.location.mountPoint, b.location.mountPoint));
    report.proportionalSizeChanged(vec3diff(a.size.proportional, b.size.proportional));
    report.differentialSizeChanged(vec3diff(a.size.differential, b.size.differential));
    report.absoluteSizeChanged(vec3diff(a.size.absolute, b.size.absolute));
    return report;
};

Specification.Internal.Report = function Report () {
    this.val = 0;
};

Specification.Internal.prototype.diff = function diff (b, report) {
    return Specification.Internal.diff(this, b, report);
};

Specification.Internal.Report.prototype.clear = function clear () {
    this.val = 0;
    return this;
};

Specification.Internal.Report.prototype.acceptParentReport = function acceptParentReport (parentReport) {
    this.val |= parentReport;
    return this;
};

Specification.Internal.Report.prototype.mountStateChanged = function mountStateChanged () {
    this.val |= 1 << 26;
    return this;
};

Specification.Internal.Report.prototype.showStateChanged = function showStateChanged () {
    this.val |= 1 << 25;
    return this;
};

Specification.Internal.Report.prototype.opacityChanged = function opacityChanged () {
    this.val |= 1 << 24;
    return this;
};

Specification.Internal.Report.prototype.alignChanged = function alignChanged (alignReport) {
    this.val |= (alignReport & 7) << 21;
    return this;
};

Specification.Internal.Report.prototype.mountPointChanged = function mountPointChanged (mountPointReport) {
    this.val |= (mountPointReport & 7) << 18;
    return this;
};

Specification.Internal.Report.prototype.positionChanged = function positionChanged (positionReport) {
    this.val |= (positionReport & 7) << 15;
    return this;
};

Specification.Internal.Report.prototype.rotationChanged = function rotationChanged (rotationReport) {
    this.val |= (rotationReport & 7) << 12;
    return this;
};

Specification.Internal.Report.prototype.scaleChanged = function scaleChanged (scaleReport) {
    this.val |= (scaleReport & 7) << 9;
    return this;
};

Specification.Internal.Report.prototype.proportionalSizeChanged = function proportionalSizeChanged (sizeReport) {
    this.val |= (sizeReport & 7) << 6;
}

Specification.Internal.Report.prototype.differentialSizeChanged = function differentialSizeChanged (sizeReport) {
    this.val |= (sizeReport & 7) << 3;
    return this;
};

Specification.Internal.Report.prototype.absoluteSizeChanged = function absoluteSizeChanged (sizeReport) {
    this.val |= (sizeReport & 7);
    return this;
};

Specification.Internal.Report.prototype.getMountStateComponent = function getMountStateComponent () {
    return this.val & (1 << 26);
};

Specification.Internal.Report.prototype.getShowStateComponent = function getShowStateComponent () {
    return this.val & (1 << 25);
};

Specification.Internal.Report.prototype.getOpacityComponent = function getOpacityComponent () {
    return this.val & (1 << 24);
};

Specification.Internal.Report.prototype.getAlignComponent = function getAlignComponent () {
    return (this.val >>> 21) & 7;
};

Specification.Internal.Report.prototype.getMountPointComponent = function getMountPointComponent () {
    return (this.val >>> 18) & 7;
};

Specification.Internal.Report.prototype.getPositionComponent = function getPositionComponent () {
    return (this.val >>> 15) & 7;
};

Specification.Internal.Report.prototype.getRotationComponent = function getRotationComponent () {
    return (this.val >>> 12) & 7;
};

Specification.Internal.Report.prototype.getScaleComponent = function getScaleComponent () {
    return (this.val >>> 9) & 7;
};

Specification.Internal.Report.prototype.getProportionalSizeComponent = function getProportionalSizeComponent () {
    return (this.val >>> 6) & 7;
};

Specification.Internal.Report.prototype.getDifferentialSizeComponent = function getDifferentialSizeComponent () {
    return (this.val >>> 3) & 7;
};

Specification.Internal.Report.prototype.getAbsoluteSizeComponent = function getAbsoluteSizeComponent () {
    return this.val & 7;
};

Specification.External = function External () {
    this.mounted = false;
    this.shown = false;
    this.opacity = 1;
    this.transform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.size = [0, 0, 0];
}

Specification.External.diff = function diff (a, b, report) {
    report = report ? report.clear() : new Specification.External.Report();
    calcMountShowOpacity(a, b, report);
    report.sizeChanged(vec3diff(a.size, b.size));
    report.transformChanged(vec16diff(a.transform, b.transform));
    return report;
};

Specification.External.Report = function Report () {
    this.val = 0;
};

Specification.External.prototype.diff = function diff (b, report) {
    return Specification.External.diff(this, b, report);
};

Specification.External.Report.prototype.clear = function clear () {
    this.val = 0;
    return this;
};

Specification.External.Report.prototype.acceptParentReport = function acceptParentReport (parentReport) {
    this.val |= parentReport;
    return this;
};

Specification.External.Report.prototype.mountStateChanged = function mountStateChanged () {
    this.val |= 1 << 21;
    return this;
};

Specification.External.Report.prototype.showStateChanged = function showStateChanged () {
    this.val |= 1 << 20;
    return this;
};

Specification.External.Report.prototype.opacityChanged = function opacityChanged () {
    this.val |= 1 << 19;
    return this;
};

Specification.External.Report.prototype.transformChanged = function transformChanged (transformReport) {
    this.val |= (transformReport & ((1 <<< 16) - 1)) << 3;
    return this;
};

Specification.External.Report.prototype.sizeChanged = function sizeChanged (sizeReport) {
    this.val |= sizeReport & 7;
    return this;
};

Specification.External.Report.prototype.getMountStateComponent = function getMountStateComponent () {
    return this.val >>> 21;
};

Specification.External.Report.prototype.getShowStateComponent = function getShowStateComponent () {
    return (this.val >>> 20) & 1;
};

Specification.External.Report.prototype.getOpacityComponent = function getOpacityComponent () {
    return (this.val >>> 19) & 1;
};

Specification.External.Report.prototype.getTransformComponent = function getTransformComponent () {
    return (this.val >>> 3) & ((1 << 16) - 1);
};

Specification.External.Report.prototype.getSizeComponent = function getSizeComponent () {
    return this.val & 7;
};

module.exports = Specification;

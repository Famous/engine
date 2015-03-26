var Specification = {};

Specification.X = 1;
Specification.Y = 2;
Specification.Z = 4;
Specification.INDEX0 = 1;
Specification.INDEX1 = 1 << 1;
Specification.INDEX2 = 1 << 2;
Specification.INDEX3 = 1 << 3;
Specification.INDEX4 = 1 << 4;
Specification.INDEX5 = 1 << 5;
Specification.INDEX6 = 1 << 6;
Specification.INDEX7 = 1 << 7;
Specification.INDEX8 = 1 << 8;
Specification.INDEX9 = 1 << 9;
Specification.INDEX10 = 1 << 10;
Specification.INDEX11 = 1 << 11;
Specification.INDEX12 = 1 << 12;
Specification.INDEX13 = 1 << 13;
Specification.INDEX14 = 1 << 14;
Specification.INDEX15 = 1 << 15;

Specification.Internal = function Internal () {
    this.mounted = false;
    this.shown = false;
    this.opacity = 1;
    this.location = {
        align: [0, 0, 0],
        mountPoint: [0, 0, 0],
        origin: [0, 0, 0],
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
    };
    this.size = {
        isAbsolute: 0,
        proportional: [1, 1, 1],
        differential: [0, 0, 0],
        absolute: [0, 0, 0]
    };
}

Specification.Internal.diff = function diff (a, b, report) {
    report = report ? report.clear() : new Specification.Internal.Report();
    calcMountShowOpacity(a, b, report);
    if (a.size.isAbsolute !== b.size.isAbsolute) report.isAbsoluteChanged();
    report.alignChanged(vec3diff(a.location.align, b.location.align));
    report.mountPointChanged(vec3diff(a.location.mountPoint, b.location.mountPoint));
    report.originChanged(vec3diff(a.location.origin, b.location.origin));
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

Specification.Internal.prototype.set = function set (spec, diffReport, rediff) {
    diffReport = diffReport ? (rediff ? this.diff(spec, diffReport) : diffReport) : this.diff(spec);

    if (diffReport.getMountStateComponent()) this.mounted = spec.mounted;
    if (diffReport.getShowStateComponent()) this.shown = spec.shown;
    if (diffReport.getOpacityComponent()) this.opacity = spec.opacity;
    if (diffReport.getIsAbsoluteComponent()) this.size.isAbsolute = spec.size.isAbsolute;

    var toVec3 = this.location.align;
    var fromVec3 = spec.location.align;
    var vec3Change = diffReport.getAlignComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.location.mountPoint;
    fromVec3 = spec.location.mountPoint;
    vec3Change = diffReport.getMountPointComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.location.origin;
    fromVec3 = spec.location.origin;
    vec3Change = diffReport.getOriginComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.location.position;
    fromVec3 = spec.location.position;
    vec3Change = diffReport.getPositionComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.location.rotation;
    fromVec3 = spec.location.rotation;
    vec3Change = diffReport.getRotationComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.location.scale;
    fromVec3 = spec.location.scale;
    vec3Change = diffReport.getScaleComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.size.proportional;
    fromVec3 = spec.size.proportional;
    vec3Change = diffReport.getProportionalSizeComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.size.differential;
    fromVec3 = spec.size.differential;
    vec3Change = diffReport.getDifferentialSizeComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    toVec3 = this.size.absolute;
    fromVec3 = spec.size.absolute;
    vec3Change = diffReport.getAbsoluteSizeComponent();
    if (vec3Change & Spec.X) toVec3[0] = fromVec3[0];
    if (vec3Change & Spec.Y) toVec3[1] = fromVec3[1];
    if (vec3Change & Spec.Z) toVec3[2] = fromVec3[2];

    return diffReport;
};

Specification.Internal.Report.prototype.clear = function clear () {
    this.val = 0;
    return this;
};

Specification.Internal.Report.prototype.addReport = function addReport (report) {
    this.val |= report;
    return this;
};

Specification.Internal.Report.prototype.setReport = function setReport (report) {
    this.val = report;
    return this;
};

Specification.Internal.Report.prototype.mountStateChanged = function mountStateChanged () {
    this.val |= 1 << 30;
    return this;
};

Specification.Internal.Report.prototype.showStateChanged = function showStateChanged () {
    this.val |= 1 << 29;
    return this;
};

Specification.Internal.Report.prototype.opacityChanged = function opacityChanged () {
    this.val |= 1 << 28;
    return this;
};

Specification.Internal.Report.prototype.alignChanged = function alignChanged (alignReport) {
    this.val |= (alignReport & 7) << 25;
    return this;
};

Specification.Internal.Report.prototype.mountPointChanged = function mountPointChanged (mountPointReport) {
    this.val |= (mountPointReport & 7) << 22;
    return this;
};

Specification.Internal.Report.prototype.originChanged = function originChanged (originReport) {
    this.val |= (originReport & 7) << 19;
}

Specification.Internal.Report.prototype.positionChanged = function positionChanged (positionReport) {
    this.val |= (positionReport & 7) << 16;
    return this;
};

Specification.Internal.Report.prototype.rotationChanged = function rotationChanged (rotationReport) {
    this.val |= (rotationReport & 7) << 13;
    return this;
};

Specification.Internal.Report.prototype.scaleChanged = function scaleChanged (scaleReport) {
    this.val |= (scaleReport & 7) << 10;
    return this;
};

Specification.Internal.Report.prototype.isAbsoluteChanged = function isAbsoluteChanged () {
    this.val |= 1 << 9;
    return this;
};

Specification.Internal.Report.prototype.proportionalSizeChanged = function proportionalSizeChanged (sizeReport) {
    this.val |= (sizeReport & 7) << 6;
};

Specification.Internal.Report.prototype.differentialSizeChanged = function differentialSizeChanged (sizeReport) {
    this.val |= (sizeReport & 7) << 3;
    return this;
};

Specification.Internal.Report.prototype.absoluteSizeChanged = function absoluteSizeChanged (sizeReport) {
    this.val |= (sizeReport & 7);
    return this;
};

Specification.Internal.Report.prototype.getMountStateComponent = function getMountStateComponent () {
    return this.val & (1 << 30);
};

Specification.Internal.Report.prototype.getShowStateComponent = function getShowStateComponent () {
    return this.val & (1 << 29);
};

Specification.Internal.Report.prototype.getOpacityComponent = function getOpacityComponent () {
    return this.val & (1 << 28);
};

Specification.Internal.Report.prototype.getAlignComponent = function getAlignComponent () {
    return (this.val >>> 25) & 7;
};

Specification.Internal.Report.prototype.getMountPointComponent = function getMountPointComponent () {
    return (this.val >>> 22) & 7;
};

Specification.Internal.Report.prototype.getOriginComponent = function getOriginComponent () {
    return (this.val >>> 19) & 7;
};

Specification.Internal.Report.prototype.getPositionComponent = function getPositionComponent () {
    return (this.val >>> 16) & 7;
};

Specification.Internal.Report.prototype.getRotationComponent = function getRotationComponent () {
    return (this.val >>> 13) & 7;
};

Specification.Internal.Report.prototype.getScaleComponent = function getScaleComponent () {
    return (this.val >>> 10) & 7;
};

Specification.Internal.Report.prototype.getIsAbsoluteComponent = function getIsAbsoluteComponent () {
    return this.val & (1 << 9);
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

Specification.External.prototype.set = function set (spec, diffReport, rediff) {
    diffReport = diffReport ? (rediff ? this.diff(spec, diffReport) : diffReport) : this.diff(spec);

    if (diffReport.getMountStateComponent()) this.mounted = spec.mounted;
    if (diffReport.getShowStateComponent()) this.shown = spec.shown;
    if (diffReport.getOpacityComponent()) this.opacity = spec.opacity;

    var report = diffReport.getTransformComponent();
    if (report & Spec.INDEX0) this.transform[0] = spec.transform[0];
    if (report & Spec.INDEX1) this.transform[1] = spec.transform[1];
    if (report & Spec.INDEX2) this.transform[2] = spec.transform[2];
    if (report & Spec.INDEX3) this.transform[3] = spec.transform[3];
    if (report & Spec.INDEX4) this.transform[4] = spec.transform[4];
    if (report & Spec.INDEX5) this.transform[5] = spec.transform[5];
    if (report & Spec.INDEX6) this.transform[6] = spec.transform[6];
    if (report & Spec.INDEX7) this.transform[7] = spec.transform[7];
    if (report & Spec.INDEX8) this.transform[8] = spec.transform[8];
    if (report & Spec.INDEX9) this.transform[9] = spec.transform[9];
    if (report & Spec.INDEX10) this.transform[10] = spec.transform[10];
    if (report & Spec.INDEX11) this.transform[11] = spec.transform[11];
    if (report & Spec.INDEX12) this.transform[12] = spec.transform[12];
    if (report & Spec.INDEX13) this.transform[13] = spec.transform[13];
    if (report & Spec.INDEX14) this.transform[14] = spec.transform[14];
    if (report & Spec.INDEX15) this.transform[15] = spec.transform[15];

    report = diffReport.getSizeComponent();
    if (report & Spec.X) this.size[0] = spec.size[0];
    if (report & Spec.Y) this.size[1] = spec.size[1];
    if (report & Spec.Z) this.size[2] = spec.size[2];

    return diffReport;
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

function calcMountShowOpacity (a, b, report) {
    if (a.mounted !== b.mounted) report.mountStateChanged();
    if (a.shown !== b.shown) report.showStateChanged();
    if (a.opacity !== b.opacity) report.opacityChanged();
}

function vec3diff (va, vb) {
    var result = 0;
    for (var i = 0 ; i < 3 ; i++) result |= (+(va[i] !== vb[i])) << i;
    return result;
}

function vec16diff (va, vb) {
    var result = 0;
    for (var i = 0 ; i < 16 ; i++) result |= (+(va[i] !== vb[i])) << i;
    return result;
}

module.exports = Specification;

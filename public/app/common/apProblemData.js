angular.module('app').factory('apProblemData', function (apGetDataConfig, apFraction, apMatrixOperations) {
    return {
        IBs: [],
        lines: 0,
        columns: 0,
        objective: "-1",
        matrixA: [],
        vectorB: [],
        vectorC: [],
        restrictions: [],
        domains: [],
        loadProblem: function(objective, data){
            this.lines = data.lines;
            this.columns = data.columns;
            this.objective = objective;
            this.matrixA = new Array();
            this.vectorB = new Array();
            this.vectorC = new Array();
            this.restrictions = data.restrictions;
            this.domains = data.domains;
            
            for (var i = 0; i < this.lines; i++){
                this.matrixA[i] = new Array();
                for (var j = 0; j < this.columns; j++){
                    this.matrixA[i][j] = data.matrixA[i][j].toFraction();
                }
                
                this.vectorB[i] = data.vectorB[i].toFraction();            
            }
            
            for (var j = 0; j < this.columns; j++){
                this.vectorC[j] = data.vectorC[j].toFraction();
            }
            
            this.prepareData();
        },
        loadTestData: function(){
            this.lines = 3;
            this.columns = 2;
            this.objective = "minimizar";
            this.matrixA = [[new apFraction("4"), new apFraction("1")],[new apFraction("-1/7"), new apFraction("-5/2")],[new apFraction("1"), new apFraction("6/7")]];
            this.vectorB = [new apFraction("5"), new apFraction("2/5"), new apFraction("3")];
            this.vectorC = [new apFraction("1"), new apFraction("-2")];
            this.restrictions = ["<=", "<=", "<="];
            this.domains = ["R>=0", "R>=0"];
        },
        prepareData: function(){
            var newIB = [];
            for (var j = this.columns + 1; j <= this.columns + this.lines; j++)
                newIB.push(j);
            
            this.addIB(newIB);
            
            for (var i = 0; i < this.lines; i++){
                this.vectorC.push(new apFraction("0"));
                for (var j = 0; j < this.lines; j++){
                    if (j === i)
                        this.matrixA[i].push(new apFraction("1"));
                    else
                        this.matrixA[i].push(new apFraction("0"));
                }
            }
        },
        getMatrixAColumn: function(j){
            var column = [];
            for (var i = 0; i < this.matrixA.length; i++){
                column.push(this.matrixA[i][j]);
            }
            return column;
        },
        addIB: function(IB){
            this.IBs.push(IB);
        },
        removeIB: function(k){
            if (this.IBs.length > k)
                this.IBs.splice(k, 1);
        },
        getIB: function(k){
            return this.IBs[k];
        },
        getNextIB: function(k){
            var nextIB = [];
            var IB = this.getIB(k);
            if (this.getJBaseEntry(k) !== -1 && this.getjMinxihji(k) !== -1){
                for (var i = 0; i < IB.length; i++){
                    if (IB[i] === this.getjMinxihji(k)){
                        nextIB.push(this.getJBaseEntry(k));
                    }
                    else{
                        nextIB.push(IB[i]);
                    }
                }
            }
            return nextIB;
        },
        getIN: function(k){
            var IN = [];
            var IB = this.getIB(k);
            for (var j = 1; j <= this.matrixA[0].length; j++){
                if (IB.indexOf(j) === -1)
                    IN.push(j);
            }
            return IN;
        },
        getB: function(k){
            if (this.getIB(k) === null){
                return [[]];
            }
            var B = [];
            var IB = this.getIB(k);
            for (var i = 0; i < this.lines; i++){
                var newLine = [];
                for (var j = 0; j < IB.length; j++){
                    newLine.push(this.matrixA[i][IB[j] - 1]);
                }
                B.push(newLine);
            }
            return B;
        },
        getInverseB: function(k){
            if (this.getIB(k) === null){
                return [[]];
            }
            var B = this.getB(k);
            return apMatrixOperations.inverseMatrix(B);
        },
        getInverseBi: function(k, i){
            var inverseB = this.getInverseB(k);
            var inverseBi = [];
            inverseBi.push(inverseB[i]);
            return inverseBi;
        },
        getN: function(k){
            var N = [];
            var IN = this.getIN(k);
            for (var i = 0; i < this.lines; i++){
                var newLine = [];
                for (var j = 0; j < IN.length; j++){
                    newLine.push(this.matrixA[i][IN[j] - 1]);
                }
                N.push(newLine);
            }
            return N;
        },
        getNJ: function(k, col){
            var IN = this.getIN(k);
            var N = this.getN(k);
            var column = [];
            for (var j = 0; j < IN.length; j++){
                if (IN[j] === col){
                    for (var i = 0; i < N.length; i++){
                        column.push(N[i][j]);
                    }
                }
            }
            return column;
        },
        getbInverseB: function(k){
            return apMatrixOperations.multiplyMatrixVector(this.getInverseB(k), this.vectorB);
        },
        getNInverseB: function(k){
            var inverseB = this.getInverseB(k);
            var N = this.getN(k);
            return apMatrixOperations.multiplyMatrices(inverseB, N);
        },
        getxB: function(k){
            var IB = this.getIB(k);  
            var xB = [];
            for (var i = 0; i < IB.length; i++){
                xB.push("x<sub>" + IB[i] + "</sub>");
            }
            return xB;
        },
        getxBi: function(k, i){
            var xB = this.getbInverseB(k);
            return xB[i][0];
        },
        getxN: function(k){
            var IN = this.getIN(k);
            var xN = [];
            for (var i = 0; i < IN.length; i++){
                xN.push("x<sub>" + IN[i] + "</sub>");
            }
            return xN;
        },
        getxA: function(){
            var xA = [];
            for (var j = 0; j < this.lines + this.columns; j++){
                xA.push("x<sub>" + (j + 1) + "</sub>");
            }
            return xA;
        },
        getxk: function(k){
            var xk = [];
            var IB = this.getIB(k);
            var bInverseB = this.getbInverseB(k);
            for (var ij = 0; ij < this.lines + this.columns; ij++)
                xk[ij] = new apFraction("0");
            
            for (var i = 0; i < IB.length; i++){
                xk[IB[i] - 1] = bInverseB[i][0];
            }
            
            return xk;
        },
        getctxk: function(k){
            var xk = this.getxk(k);
            var ctxk = new apFraction("0");
            for (var ij = 0; ij < this.lines + this.columns; ij++){
                var res = this.vectorC[ij].multiply(xk[ij]);
                ctxk = ctxk.add(res);
            }
            return ctxk;
        },
        getcB: function(k){
            var cB = [[]];
            var IB = this.getIB(k);
            for (var j = 0; j < IB.length; j++){
                cB[0].push(this.vectorC[IB[j] - 1]);
            } 
            return cB;
        },
        getcBLabels: function(k){
            var IB = this.getIB(k);  
            var cB = [];
            for (var i = 0; i < IB.length; i++){
                cB.push("c<sub>" + IB[i] + "</sub>");
            }
            return cB;
        },
        getcBInverseB: function(k){
            var cB = this.getcB(k);
            var inverseB = this.getInverseB(k);
            return apMatrixOperations.multiplyMatrices(cB, inverseB);
        },
        getcBbInverseB: function(k){
            var cB = this.getcB(k);
            var bInverseB = this.getbInverseB(k);
            return apMatrixOperations.multiplyMatrices(cB, bInverseB)[0][0];
        },
        getcBNInverseB: function(k){
            var cB = this.getcB(k);
            var NInverseB = this.getNInverseB(k);
            return apMatrixOperations.multiplyMatrices(cB, NInverseB);
        },
        getzN: function(k){
            var IN = this.getIN(k);
            var zN = [];
            for (var i = 0; i < IN.length; i++){
                zN.push("z<sub>" + IN[i] + "</sub>");
            }
            return zN;
        },
        getcN: function(k){
            var IN = this.getIN(k);
            var cN = [[]];
            for (var i = 0; i < IN.length; i++){
                cN[0].push(this.vectorC[IN[i] - 1]);
            }
            return cN;
        },
        getcNMinuszN: function(k){
            var cNMinuszN = [[]];
            var cN = this.getcN(k);
            var zN = this.getcBNInverseB(k);
            for (var i = 0; i < cN[0].length; i++){
                cNMinuszN[0].push(cN[0][i].subtract(zN[0][i]));
            }
            return cNMinuszN;
        },
        getJBaseEntry: function(k){
            var cNMinuszN = this.getcNMinuszN(k);
            for (var i = 0; i < cNMinuszN[0].length; i++){
                if (this.objective === "minimizar"){
                    if (cNMinuszN[0][i].isNegative())
                        return this.getIN(k)[i];
                }
                else{
                    if (!cNMinuszN[0][i].isNegative() && !cNMinuszN[0][i].isZero())
                        return this.getIN(k)[i];
                }
            }
            return -1;
        },
        getcjzj: function(k){
            var cnzn = this.getcNMinuszN(k);
            var j = this.getJBaseEntry(k);
            var IN = this.getIN(k);
            for (var i = 0; i < cnzn[0].length; i++){
                if (IN[i] === j){
                    return cnzn[0][i];
                }
            }
            return new apFraction("-1");
        },
        getxihji: function(k){
            var bInverseB = this.getbInverseB(k);
            var xi = this.getNJ(k, this.getJBaseEntry(k));
            var xihji = [];
            for (var i = 0; i < xi.length; i++){
                if (!xi[i].isZero() && !xi[i].isNegative()){
                    xihji.push(bInverseB[i][0].divide(xi[i]));
                }
                else{
                    xihji.push(new apFraction("-1"));
                }
            }
            return xihji;
        },
        getMinxihji: function(k){
            var xihji = this.getxihji(k);
            var min = new apFraction("-1");
            for (var i = 0; i < xihji.length; i++){
                if (xihji[i].value() >= 0 && (xihji[i].value() < min.value() || min.isOneNegative())){
                    min = xihji[i];
                }
            }
            return min;
        },
        getjMinxihji: function(k){
            var xihji = this.getxihji(k);
            var min = new apFraction("-1");
            var jMin = -1;
            for (var i = 0; i < xihji.length; i++){
                if (xihji[i].value() >= 0 && (xihji[i].value() < min.value() || min.isOneNegative())){
                    min = xihji[i];
                    jMin = this.getIB(k)[i];
                }
            }
            return jMin;
        },
        getuT: function(k){
            var cB = this.getcB(k);
            var inverseB = this.getInverseB(k);
            var uT = apMatrixOperations.multiplyMatrices(cB, inverseB);
            return uT;
        },
        getbTu: function(k){
            var uT = this.getuT(k);
            var bTu = apMatrixOperations.multiplyMatrixVector(uT, this.vectorB);
            return bTu[0][0];
        },
        getTu: function(k){
            var uT = this.getuT(k);
            var Tu = [];
            for (var i = 0; i < uT[0].length; i++){
                var newLine = [];
                newLine.push(uT[0][i]);
                Tu.push(newLine);
            }
            return Tu;
        },
        getzj: function(k, j){
            var uT = this.getuT(k);
            var aB = this.getMatrixAColumn(j);
            var zj = apMatrixOperations.multiplyMatrixVector(uT, aB);
            return zj[0][0];
        },
        gethj: function(k, j){
            var inverseB = this.getInverseB(k);
            var aB = this.getMatrixAColumn(j);
            var hj = apMatrixOperations.multiplyMatrixVector(inverseB, aB);
            return hj;
        },
        gethji: function(k, j, i){
            var hj = this.gethj(k, j);
            return hj[i][0];
        },
        getcjminzj: function(k, j){
            var zj = this.getzj(k, j);
            var cjminzj = this.vectorC[j].subtract(zj);
            return cjminzj;
        },
        getzjmincj: function(k, j){
            var zj = this.getzj(k, j);
            var zjmincj = zj.subtract(this.vectorC[j]);
            return zjmincj;
        },
        getyi: function(k, i){
            var inverseBi = this.getInverseBi(k, i);
            var N = this.getN(k);
            var yi = apMatrixOperations.multiplyMatrices(inverseBi, N);
            return yi;
        },
        getyik: function(k, i, paramK){
            var yi = this.getyi(k, i);
            return yi[0][paramK];
        },
        getcjzjyik: function(k, j, i, paramK){
            var cjzj = this.getcjminzj(k, j);
            var yik = this.getyik(k, i, paramK);
            var cjzjyik = cjzj.divide(yik);
            return cjzjyik;
        },
        getzjcjyik: function(k, j, i, paramK){
            var zjcj = this.getzjmincj(k, j);
            var yik = this.getyik(k, i, paramK);
            var zjcjyik = zjcj.divide(yik);
            return zjcjyik;
        },
        getxbihji: function(k, j, i){
            var xbi = this.getxBi(k, i);
            var hji = this.gethji(k, j, i);
            var xbihji = xbi.divide(hji);
            return xbihji;
        }
    };
});
  // ================================================================
  //  로드스터 풍 각진 쐐기형 차체 메쉬 (좌표: x=오른쪽, y=앞쪽(진행 방향), z=위쪽, 원점=차체 중심, 단위 m)
  //  단면 6각형을 앞→뒤 8개 지점에 놓고 면으로 이어 "깎은" 듯한 각진 형태를 만듦
  // ================================================================
  function carMesh(L, W, H, siren) {
    const G = { body: [], glass: [], dark: [], head: [], tail: [], pad: [], light1: [], light2: [], cross: [] };
    const hw = W / 2;
    // 지점: [앞뒤위치(L 비율), 하부폭, 어깨폭, 지붕폭(폭 비율), 하부높이, 어깨높이, 지붕높이(H 비율)]
    const ST = [
      [0.50, 0.62, 0.66, 0.52, 0.10, 0.24, 0.26],   // 코 끝(낮고 뾰족)
      [0.46, 0.78, 0.90, 0.72, 0.08, 0.34, 0.36],
      [0.30, 0.86, 1.00, 0.84, 0.06, 0.42, 0.44],   // 후드
      [0.14, 0.88, 1.00, 0.86, 0.06, 0.46, 0.48],   // 앞유리 시작
      [-0.02, 0.86, 1.00, 0.62, 0.06, 0.48, 0.88],  // 지붕 앞
      [-0.22, 0.86, 1.00, 0.60, 0.06, 0.48, 0.86],  // 지붕 뒤
      [-0.40, 0.86, 1.00, 0.82, 0.06, 0.48, 0.58],  // 뒤 데크
      [-0.50, 0.80, 0.96, 0.86, 0.08, 0.48, 0.54]   // 꼬리
    ];

    const ring = (s) => {
      const y = s[0] * L, bw = s[1] * hw, sw = s[2] * hw, rw = s[3] * hw, zb = s[4] * H - H / 2, zs = s[5] * H - H / 2, zr = s[6] * H - H / 2;
      return [[-bw, y, zb], [bw, y, zb], [sw, y, zs], [rw, y, zr], [-rw, y, zr], [-sw, y, zs]];
    };
    const R = ST.map(ring);
    const quad = (g, a, b, c, d) => { G[g].push([a, b, c], [a, c, d]); };
    const poly = (g, pts) => { for (let i = 1; i < pts.length - 1; i++) G[g].push([pts[0], pts[i], pts[i + 1]]); };
    for (let i = 0; i < ST.length - 1; i++) {
      const A = R[i], B = R[i + 1], cabin = i >= 3 && i <= 5;                       // 3~5 구간 = 유리 온실(앞유리·지붕·뒷유리)
      quad("dark", A[0], A[1], B[1], B[0]);                                          // 바닥
      quad("body", A[1], A[2], B[2], B[1]);                                          // 오른쪽 아래 옆면
      quad(cabin ? "glass" : "body", A[2], A[3], B[3], B[2]);                        // 오른쪽 위 옆면(창)
      quad(cabin ? "glass" : "body", A[3], A[4], B[4], B[3]);                        // 윗면(후드/유리 지붕/데크)
      quad(cabin ? "glass" : "body", A[4], A[5], B[5], B[4]);                        // 왼쪽 위 옆면(창)
      quad("body", A[5], A[0], B[0], B[5]);                                          // 왼쪽 아래 옆면
    }
    poly("body", R[0].slice().reverse());                                            // 코 앞면
    poly("dark", R[ST.length - 1]);                                                  // 꼬리 뒷면
    const box = (g, cx, cy, cz, sx, sy, sz) => {
      const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
      const p = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      quad(g, p[0], p[1], p[2], p[3]); quad(g, p[4], p[5], p[6], p[7]); quad(g, p[0], p[1], p[5], p[4]);
      quad(g, p[2], p[3], p[7], p[6]); quad(g, p[1], p[2], p[6], p[5]); quad(g, p[3], p[0], p[4], p[7]);
    };
    const prismX = (g, cx, cy, cz, rad, wid) => {                                   // x축 방향 8각 기둥(바퀴)
      const a = [], b = [];
      for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4 + Math.PI / 8; a.push([cx - wid / 2, cy + rad * Math.cos(ang), cz + rad * Math.sin(ang)]); b.push([cx + wid / 2, cy + rad * Math.cos(ang), cz + rad * Math.sin(ang)]); }
      for (let k = 0; k < 8; k++) quad(g, a[k], a[(k + 1) % 8], b[(k + 1) % 8], b[k]);
      poly(g, a); poly(g, b);
    };
    const prismZ = (g, cx, cy, cz, rad, hgt) => {                                   // z축 방향 8각 원판(양력 패드)
      const a = [], b = [];
      for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; a.push([cx + rad * Math.cos(ang), cy + rad * Math.sin(ang), cz - hgt / 2]); b.push([cx + rad * Math.cos(ang), cy + rad * Math.sin(ang), cz + hgt / 2]); }
      for (let k = 0; k < 8; k++) quad(g, a[k], a[(k + 1) % 8], b[(k + 1) % 8], b[k]);
      poly(g, a); poly(g, b);
    };
    const zBot = ST[3][4] * H - H / 2, wr = 0.065 * L;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      prismX("dark", sx * (hw * 0.92 - 0.0375 * L), sy * 0.30 * L, zBot + wr * 0.7, wr, 0.075 * L);   // 바퀴
      prismZ("pad", sx * hw * 0.40, sy * 0.30 * L, zBot - 0.9, 0.065 * L, 0.5);                      // 아래로 빛나는 양력 패드
    }
    box("head", 0, 0.497 * L, 0.20 * H - H / 2, 0.95 * hw, 0.012 * L, 0.035 * H);    // 앞 헤드라이트 띠
    box("tail", 0, -0.503 * L, 0.46 * H - H / 2, 1.6 * hw, 0.012 * L, 0.06 * H);     // 뒤 테일라이트 띠
    if (siren) {                                                                      // 구조차: 지붕 경광등 + 십자
      const rz = 0.88 * H - H / 2 + 0.03 * H;
      box("light1", -0.2 * hw, -0.12 * L, rz, 0.34 * hw, 0.05 * L, 0.06 * H);
      box("light2", 0.2 * hw, -0.12 * L, rz, 0.34 * hw, 0.05 * L, 0.06 * H);
      box("cross", 0, 0.06 * L, rz - 0.02 * H, 0.9 * hw, 0.05 * L, 0.03 * H);
      box("cross", 0, 0.06 * L, rz - 0.02 * H, 0.22 * hw, 0.22 * L, 0.03 * H);
    }
    return G;
  }

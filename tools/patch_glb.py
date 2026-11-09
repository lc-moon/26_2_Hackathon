# 모델 방향·중심 보정 스크립트: Sketchfab 원본 GLB 는 앞이 +X 이고 중심이 원점이 아니라서
# 루트 노드 행렬을 바꿔 "앞 = +Z(glTF 표준), 차체 중심 = 원점" 으로 맞춘다.
# 사용: python3 patch_glb.py 원본.glb 결과.glb   (이번 모델 기준 중심값 c 를 사용. 다른 모델이면 bbox 를 다시 계산해 c 를 바꿀 것)
import struct, json, sys, numpy as np
src, dst = sys.argv[1], sys.argv[2]
d = open(src, 'rb').read()
cl, _ = struct.unpack('<I4s', d[12:20]); j = json.loads(d[20:20+cl]); rest = d[20+cl:]
c = np.array([2.157, 0.5575, -0.1005])                              # 변환 후 bbox 중심(m) — 모델마다 다름
T = np.eye(4); T[:3, 3] = -c
R = np.eye(4); R[:3, :3] = np.array([[0, 0, -1], [0, 1, 0], [1, 0, 0]], float)   # +X → +Z
M0 = np.array(j['nodes'][0]['matrix']).reshape(4, 4).T
j['nodes'][0]['matrix'] = [float(x) for x in (R @ T @ M0).T.flatten()]
js = json.dumps(j, separators=(',', ':'), ensure_ascii=False).encode('utf-8'); js += b' ' * ((4 - len(js) % 4) % 4)
out = struct.pack('<4sII', b'glTF', 2, 12 + 8 + len(js) + len(rest)) + struct.pack('<I4s', len(js), b'JSON') + js + rest
open(dst, 'wb').write(out)

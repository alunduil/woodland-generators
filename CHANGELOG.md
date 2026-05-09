# CHANGELOG

All notable changes to this project appear in this file.

The format follows [Keep a CHANGELOG](https://keepachangelog.com/en/1.1.0/), and
this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0](https://github.com/alunduil/woodland-generators/compare/woodland-generators-v0.2.0...woodland-generators-v0.3.0) (2026-05-09)


### ⚠ BREAKING CHANGES

* extract CLI to @woodland-generators/cli ([#278](https://github.com/alunduil/woodland-generators/issues/278))
* extract generator core to @woodland-generators/core ([#271](https://github.com/alunduil/woodland-generators/issues/271))
* retire PDF playbook source layer ([#267](https://github.com/alunduil/woodland-generators/issues/267))

### Added

* **github:** adopt three-template issue lifecycle ([#269](https://github.com/alunduil/woodland-generators/issues/269)) ([def8a9c](https://github.com/alunduil/woodland-generators/commit/def8a9cc12525927c2b80fab895d3b4d7b690441))
* retire PDF playbook source layer ([#267](https://github.com/alunduil/woodland-generators/issues/267)) ([30f5cd2](https://github.com/alunduil/woodland-generators/commit/30f5cd21ceb2b54d514982d99bfd45cc5f6c6b2d))


### Fixed

* **deps:** update dependency pino to v10 ([#259](https://github.com/alunduil/woodland-generators/issues/259)) ([d5c33ac](https://github.com/alunduil/woodland-generators/commit/d5c33acee8fb16c801c81e334879168274b97247))


### Changed

* extract CLI to @woodland-generators/cli ([#278](https://github.com/alunduil/woodland-generators/issues/278)) ([3f7887a](https://github.com/alunduil/woodland-generators/commit/3f7887aa73a3399cf8f6be2d542e68e1229da100))
* extract generator core to @woodland-generators/core ([#271](https://github.com/alunduil/woodland-generators/issues/271)) ([81a895c](https://github.com/alunduil/woodland-generators/commit/81a895c8e5050c642f6f39c272645e66a2892046))
* **pdf:** normalize whitespace before anchor matching ([#206](https://github.com/alunduil/woodland-generators/issues/206)) ([3407667](https://github.com/alunduil/woodland-generators/commit/340766749c1777bc5bbff7edb6e8784ab71f0196))
* **pdf:** page-aware section splitter ([#204](https://github.com/alunduil/woodland-generators/issues/204)) ([a11efab](https://github.com/alunduil/woodland-generators/commit/a11efabff095f91a04b511b6cd3bfba90ab6a16b)), closes [#199](https://github.com/alunduil/woodland-generators/issues/199)
* **pdf:** section-ordering-aware field parsers ([#207](https://github.com/alunduil/woodland-generators/issues/207)) ([4833aa2](https://github.com/alunduil/woodland-generators/commit/4833aa2b0bf50d00eda4a7ba0a692a1704c873e3))


### Documentation

* add CLAUDE.md routing AI agents to repo conventions ([#258](https://github.com/alunduil/woodland-generators/issues/258)) ([4b09e8f](https://github.com/alunduil/woodland-generators/commit/4b09e8f304ca05ed1d2b4d979e08c1f408843993))
* prune obsolete [Unreleased] block in root CHANGELOG ([#266](https://github.com/alunduil/woodland-generators/issues/266)) ([8504e77](https://github.com/alunduil/woodland-generators/commit/8504e777c2af6097b9b7c4fa709056cef07b9416))


### Maintenance

* convert repo to pnpm workspaces ([#264](https://github.com/alunduil/woodland-generators/issues/264)) ([3f05d95](https://github.com/alunduil/woodland-generators/commit/3f05d951091b56d275c5e0ec3d06265d58a652de))
* deflect questions to GitHub Discussions ([#268](https://github.com/alunduil/woodland-generators/issues/268)) ([49b7ed0](https://github.com/alunduil/woodland-generators/commit/49b7ed04110aba79865e454beda594316f3fe920)), closes [#219](https://github.com/alunduil/woodland-generators/issues/219)
* **deps:** lock file maintenance ([#260](https://github.com/alunduil/woodland-generators/issues/260)) ([9a5c488](https://github.com/alunduil/woodland-generators/commit/9a5c488af655ea4f7eb1b475afbb36d4e7616bdf))
* **deps:** lock file maintenance ([#261](https://github.com/alunduil/woodland-generators/issues/261)) ([eb978b4](https://github.com/alunduil/woodland-generators/commit/eb978b44c3dc1bf373c3d0cae949e85f51fe4760))
* **deps:** update dependency npm-check-updates to v22 ([#250](https://github.com/alunduil/woodland-generators/issues/250)) ([99d33aa](https://github.com/alunduil/woodland-generators/commit/99d33aa369042f80d2a52d53b5cc4032052d0cfd))
* **deps:** update eslint monorepo to v10 (major) ([#252](https://github.com/alunduil/woodland-generators/issues/252)) ([e879716](https://github.com/alunduil/woodland-generators/commit/e8797165fa3b01ef4d9a5ac5593c9670ba5f9f8f))
* **deps:** update npm dependencies to v8.59.2 ([#249](https://github.com/alunduil/woodland-generators/issues/249)) ([57b14d6](https://github.com/alunduil/woodland-generators/commit/57b14d6c092804e26d8b37dd828d9be43d71533d))

## [0.2.0](https://github.com/alunduil/woodland-generators/compare/woodland-generators-v0.1.0...woodland-generators-v0.2.0) (2026-05-04)


### Added

* **pdf:** tag parser failures with their stage ([#188](https://github.com/alunduil/woodland-generators/issues/188)) ([1099f25](https://github.com/alunduil/woodland-generators/commit/1099f25353018a913080f50d0f4c72c1dfa69ee7))


### Fixed

* add missing permissions to pre-commit sync ([723707a](https://github.com/alunduil/woodland-generators/commit/723707ae4430f328189b023e65db5249c21ac51f))
* detached head push in pre-commit sync ([18b706b](https://github.com/alunduil/woodland-generators/commit/18b706b6695ae4637e35c32ebc67e46ab1347c48))
* downgrade Jest to 29.7.0 for jest-bench compatibility ([3531571](https://github.com/alunduil/woodland-generators/commit/35315711afe9d19e3e201e1a3335bdcf4fca2b4a))
* use a PAT token to retrigger workflows ([cb81dec](https://github.com/alunduil/woodland-generators/commit/cb81dec7b062ff84e160b0e0d5a8f51012507e10))


### Changed

* rename stats module to maths to prepare for character stats ([b6c4d67](https://github.com/alunduil/woodland-generators/commit/b6c4d6798839f408eaa75616f58a0863bca32f7a))
* rename stats module to maths to prepare for character stats ([9215ffa](https://github.com/alunduil/woodland-generators/commit/9215ffa9af6808ac4a494ee8c2ee900e54e09bb9))
* rename tools directory to scripts and add benchmark processing ([faccc7b](https://github.com/alunduil/woodland-generators/commit/faccc7b4eb896341c211f4ea85d5bee8c695394c))


### Documentation

* align README with shipped scope ([#173](https://github.com/alunduil/woodland-generators/issues/173)) ([fef1613](https://github.com/alunduil/woodland-generators/commit/fef161334b551130654ee3524e30ea6d67d13d3f))
* backfill CHANGELOG with demeanor and details ([#148](https://github.com/alunduil/woodland-generators/issues/148)) ([8515408](https://github.com/alunduil/woodland-generators/commit/85154080623edef0239180c9978d168f8accfab3))


### Maintenance

* **actions:** gate bench on perf-relevant paths ([#175](https://github.com/alunduil/woodland-generators/issues/175)) ([171f4f8](https://github.com/alunduil/woodland-generators/commit/171f4f826965fac6d6f7fbd4ad9d6364efdfda31))
* **actions:** harden workflow defaults ([#147](https://github.com/alunduil/woodland-generators/issues/147)) ([4454795](https://github.com/alunduil/woodland-generators/commit/4454795a0155ac011c83e44c37899eed7f4a45c2)), closes [#119](https://github.com/alunduil/woodland-generators/issues/119)
* adopt release-please for automated releases ([#180](https://github.com/alunduil/woodland-generators/issues/180)) ([7438231](https://github.com/alunduil/woodland-generators/commit/743823189658a3593df375c7840e070c381a891f)), closes [#166](https://github.com/alunduil/woodland-generators/issues/166)
* bump Node engines to &gt;=20 ([#145](https://github.com/alunduil/woodland-generators/issues/145)) ([4735efc](https://github.com/alunduil/woodland-generators/commit/4735efc8c6c668dde6d61ce1dc9b31b55d8b8d6a)), closes [#120](https://github.com/alunduil/woodland-generators/issues/120)
* migrate from Dependabot to Renovate ([#143](https://github.com/alunduil/woodland-generators/issues/143)) ([2fc3b86](https://github.com/alunduil/woodland-generators/commit/2fc3b86d43b90d4d0a15538b4babff85bf154c70))
* retire duplicate check:* npm scripts ([#186](https://github.com/alunduil/woodland-generators/issues/186)) ([68bddc4](https://github.com/alunduil/woodland-generators/commit/68bddc4c7ac47d50baefb5dff3ec42cfd7a896e3))
* retire sync:deps script and sync-precommit workflow ([#172](https://github.com/alunduil/woodland-generators/issues/172)) ([ee3b437](https://github.com/alunduil/woodland-generators/commit/ee3b4379380d2b4369e694dfea3f1a7617f83870))

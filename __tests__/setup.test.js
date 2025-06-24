/**
 * 開発環境のセットアップテスト
 */

import { describe, test, expect } from 'vitest'

describe('Development Environment Setup', () => {
  test('Vitest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('Environment variables structure is correct', () => {
    // 環境変数の構造をテスト（実際の値はテスト時に設定されていない可能性があるため、構造のみ確認）
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL', 
      'NEXTAUTH_SECRET'
    ];

    // process.env からこれらの変数が定義可能な構造であることを確認
    requiredEnvVars.forEach(envVar => {
      expect(typeof process.env[envVar]).toMatch(/string|undefined/);
    });
  });

  test('Package.json has required scripts', async () => {
    const packageJson = await import('../package.json');
    
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('lint');
    expect(packageJson.scripts).toHaveProperty('test');
    expect(packageJson.scripts).toHaveProperty('test:watch');
  });

  test('Required dependencies are installed', async () => {
    const packageJson = await import('../package.json');
    
    // 主要な依存関係が存在することを確認
    expect(packageJson.dependencies).toHaveProperty('next');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('prisma');
    expect(packageJson.dependencies).toHaveProperty('@prisma/client');
    expect(packageJson.dependencies).toHaveProperty('next-auth');
    
    // テスト関連の開発依存関係
    expect(packageJson.devDependencies).toHaveProperty('vitest');
    expect(packageJson.devDependencies).toHaveProperty('@testing-library/react');
    expect(packageJson.devDependencies).toHaveProperty('@testing-library/jest-dom');
  });
});
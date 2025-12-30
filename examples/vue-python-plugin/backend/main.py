#!/usr/bin/env python3
import sys
import json
import re
from datetime import datetime
from collections import Counter

def format_json(args):
    """格式化 JSON 数据"""
    try:
        data = json.loads(args)
        input_text = data.get('data', '')
        
        # 尝试解析为 JSON
        try:
            parsed = json.loads(input_text)
            formatted = json.dumps(parsed, indent=2, ensure_ascii=False)
            
            return json.dumps({
                'success': True,
                'result': formatted,
                'message': '✅ JSON 格式化成功',
                'stats': {
                    'original_length': len(input_text),
                    'formatted_length': len(formatted),
                    'type': type(parsed).__name__
                }
            }, ensure_ascii=False)
        except json.JSONDecodeError as e:
            return json.dumps({
                'success': False,
                'error': f'JSON 解析错误: {str(e)}',
                'suggestion': '请检查 JSON 格式是否正确'
            }, ensure_ascii=False)
            
    except Exception as e:
        return json.dumps({'error': f'处理失败: {str(e)}'}, ensure_ascii=False)

def validate_data(args):
    """验证数据格式"""
    try:
        data = json.loads(args)
        input_text = data.get('data', '')
        
        validations = {
            'length': len(input_text),
            'is_empty': len(input_text.strip()) == 0,
            'is_json': False,
            'is_email': False,
            'is_url': False,
            'is_number': False,
            'contains_chinese': bool(re.search(r'[\u4e00-\u9fff]', input_text)),
            'line_count': len(input_text.splitlines()),
            'word_count': len(input_text.split())
        }
        
        # JSON 验证
        try:
            json.loads(input_text)
            validations['is_json'] = True
        except:
            pass
            
        # 邮箱验证
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        validations['is_email'] = bool(re.match(email_pattern, input_text.strip()))
        
        # URL 验证
        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        validations['is_url'] = bool(re.match(url_pattern, input_text.strip()))
        
        # 数字验证
        try:
            float(input_text.strip())
            validations['is_number'] = True
        except:
            pass
        
        return json.dumps({
            'success': True,
            'validations': validations,
            'message': '✅ 数据验证完成'
        }, ensure_ascii=False, indent=2)
        
    except Exception as e:
        return json.dumps({'error': f'验证失败: {str(e)}'}, ensure_ascii=False)

def transform_data(args):
    """数据转换"""
    try:
        data = json.loads(args)
        input_text = data.get('data', '')
        
        transformations = {
            'original': input_text,
            'uppercase': input_text.upper(),
            'lowercase': input_text.lower(),
            'title_case': input_text.title(),
            'reversed': input_text[::-1],
            'no_spaces': input_text.replace(' ', ''),
            'no_punctuation': re.sub(r'[^\w\s]', '', input_text),
            'words_only': ' '.join(re.findall(r'\b\w+\b', input_text)),
            'numbers_only': ''.join(re.findall(r'\d', input_text)),
            'first_10_chars': input_text[:10],
            'last_10_chars': input_text[-10:] if len(input_text) > 10 else input_text
        }
        
        return json.dumps({
            'success': True,
            'transformations': transformations,
            'message': '✅ 数据转换完成'
        }, ensure_ascii=False, indent=2)
        
    except Exception as e:
        return json.dumps({'error': f'转换失败: {str(e)}'}, ensure_ascii=False)

def calculate_statistics(args):
    """统计分析"""
    try:
        data = json.loads(args)
        input_text = data.get('data', '')
        
        # 字符统计
        char_counter = Counter(input_text)
        word_counter = Counter(input_text.lower().split())
        
        # 基础统计
        stats = {
            'basic': {
                'total_chars': len(input_text),
                'total_words': len(input_text.split()),
                'total_lines': len(input_text.splitlines()),
                'unique_chars': len(set(input_text)),
                'unique_words': len(set(input_text.lower().split()))
            },
            'character_types': {
                'letters': sum(1 for c in input_text if c.isalpha()),
                'digits': sum(1 for c in input_text if c.isdigit()),
                'spaces': sum(1 for c in input_text if c.isspace()),
                'punctuation': sum(1 for c in input_text if not c.isalnum() and not c.isspace()),
                'uppercase': sum(1 for c in input_text if c.isupper()),
                'lowercase': sum(1 for c in input_text if c.islower())
            },
            'most_common_chars': dict(char_counter.most_common(5)),
            'most_common_words': dict(word_counter.most_common(5)),
            'analysis_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return json.dumps({
            'success': True,
            'statistics': stats,
            'message': '📊 统计分析完成'
        }, ensure_ascii=False, indent=2)
        
    except Exception as e:
        return json.dumps({'error': f'统计失败: {str(e)}'}, ensure_ascii=False)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(json.dumps({'error': '参数不足'}, ensure_ascii=False))
        sys.exit(1)
    
    function_name = sys.argv[1]
    args = sys.argv[2]
    
    # 路由到对应的函数
    functions = {
        'format': format_json,
        'validate': validate_data,
        'transform': transform_data,
        'statistics': calculate_statistics
    }
    
    if function_name in functions:
        result = functions[function_name](args)
        print(result)
    else:
        print(json.dumps({'error': f'未知函数: {function_name}'}, ensure_ascii=False))
        sys.exit(1)